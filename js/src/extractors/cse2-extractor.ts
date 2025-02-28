import * as fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
import {type ContactInfo, type FacultyInfo} from '../types.js';
import {logger} from '../index.js';
import {type CustomExtractor} from '../interface.js';
import {logError} from '../utils.js';
import {
  getText,
  getDeptId,
  validateAndSplitPhoneNumbers,
  cleanContactInfoEmptyFields,
  parseRoomAndBuilding,
  categorizeEmailByDomain,
} from './utils/index.js';

/**
 * A custom extractor for `https://cse.bubt.edu.bd/faculty`.
 * Implements the `CustomExtractor` interface to define extraction logic.
 */
export class Cse2Extractor implements CustomExtractor {
  private readonly childLogger = logger.child({alias: 'cse2'});

  /**
   * Parses faculty information from a profile card DOM element
   * @param {cheerio.CheerioAPI} bs4 - Cheerio instance for DOM manipulation and traversal
   * @param {Element} elem - Target DOM element of faculty card from the faculty list page
   * @returns {FacultyInfo | undefined} Structured faculty data or undefined if element is invalid
   * @throws {Error} Throws error if element structure is unexpected
   */
  public parseProfileCard(
    bs4: cheerio.CheerioAPI,
    element_: Element,
  ): FacultyInfo | undefined {
    try {
      const element = bs4(element_);

      const profileUrl = element.find('div.single_fac_intro > a').attr('href');
      const departmentText = getText('div.fac_title p', element);
      const department = getDeptId(departmentText);

      const fcode = getText('div.fac_title p span', element);
      const name = getText('div.fac_title a h3', element);
      const designation = getText('div.fac_title h6', element);

      const email =
        categorizeEmailByDomain(
          getText('div.s_f_cart:nth-child(1) p', element),
        ) ?? '';

      const status = getText('div.fac_title a+span', element);

      const roomBuildTxt = getText('div.s_f_cart:nth-child(2) p', element);
      const parsedText = parseRoomAndBuilding(roomBuildTxt);
      const room = parsedText.room;
      const building = parsedText.building;

      return {
        department,
        name,
        fcode,
        designation,
        room,
        building,
        telephone: '',
        email,
        status,
        profileUrl: profileUrl ?? '',
      };
    } catch (error) {
      logError(
        'Error parsing faculty card',
        undefined,
        error,
        this.childLogger,
      );
      return undefined;
    }
  }

  /**
   * Parses a faculty profile page from a given file path
   * @async
   * @param {string} filePath - Path to the file containing the profile page data
   * @returns {Promise<FacultyInfo | undefined>} Parsed faculty information or undefined if parsing fails
   * @throws {Error} Throws error if file cannot be read or contains invalid format
   */
  public async parseProfilePage(
    filePath: string,
  ): Promise<FacultyInfo | undefined> {
    try {
      const htmlContent = await fs.readFile(filePath, 'utf8');
      const bs4 = cheerio.load(htmlContent);

      const container = bs4('div.f-detail_area > div.container');

      if (container.length === 0) {
        throw new Error('Container not found');
      }

      const departmentText = getText(
        'div.fac_detail.fac_name > div.fac_title > p',
        container,
      );
      const department = getDeptId(departmentText);

      const name = getText('div.fac_title > h2', container);
      const designation = getText('div.fac_title > h6', container);
      const email =
        categorizeEmailByDomain(getText('div.f_mail > a', container)) ?? '';

      const phoneCellText = container
        .find('div.fac_cart > div.f_cell > p')
        .html();
      const telephone = this.parsePhoneNums(phoneCellText);

      return {
        department,
        name,
        fcode: '', // Extracted from card, unavailable at page
        designation,
        room: '', // Extracted from card
        building: '', // Extracted from card
        telephone: telephone ?? '',
        email,
        status: '', // Extracted from card
        profileUrl: '',
      };
    } catch (error) {
      logError(
        'Error parsing faculty page',
        undefined,
        error,
        this.childLogger,
      );
      return undefined;
    }
  }

  private parsePhoneNums(html: string | undefined): ContactInfo | undefined {
    if (!html) {
      return undefined;
    }

    const data: Record<string, string[]> = {
      personal: [],
      office: [],
      other: [],
    };

    const parts = html.split('<br>').map((x) => x.trim());
    for (const part of parts) {
      let [ctype, cval] = part.split(':').map((x) => x.trim());
      ctype = ctype.toLowerCase();

      const validatedNumbers = validateAndSplitPhoneNumbers(cval);
      if (!validatedNumbers) {
        continue;
      }

      let category: string;
      if (ctype.includes('cell')) {
        category = 'personal';
      } else if (ctype.includes('office')) {
        category = 'office';
      } else {
        category = 'other';
      }

      data[category] = [...new Set([...data[category], ...validatedNumbers])];
    }

    return cleanContactInfoEmptyFields(data);
  }
}
