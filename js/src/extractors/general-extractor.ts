import * as fs from 'node:fs/promises';
import * as cheerio from 'cheerio';
import {type Logger} from 'winston';
import {type FacultyInfo} from '../types.js';
import {logger} from '../index.js';
import {type CustomExtractor} from '../interface.js';
import {logError} from '../utils.js';
import {getDeptId, categorizeEmailByDomain, getText} from './utils/index.js';

/**
 * A custom general extractor for `https://bubt.edu.bd`.
 * Implements the `CustomExtractor` interface to define extraction logic.
 */
export class GeneralExtractor implements CustomExtractor {
  private readonly childLogger: Logger;

  constructor(public alias: string) {
    this.childLogger = logger.child({alias});
  }

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

      const profileUrl =
        element.find('div.faculty-member > a').attr('href') ?? '';
      const fcode =
        element.find('div.faculty-member > a > img').attr('alt') ?? '';

      const name = element
        .find('div.member_name > h3')
        .contents()
        .first()
        .text()
        .trim();

      const designation = getText('div.member_name > h3 > span > em', element);
      const status = getText('div.member_name > h3 > sub', element);

      return {
        department: undefined,
        name,
        fcode,
        designation,
        room: '',
        building: '',
        telephone: '',
        email: '',
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

      const container = bs4('div.panel > div.row > div.no_padding');

      const name = getText('h2 > strong', container);

      const status = getText('h2 > sub', container);

      let fcode = '';
      let department;
      let email = '';

      container.find('div > p').each((index, element) => {
        const textElement = bs4(element);
        const parts = textElement
          .text()
          .split('\n')
          .map((part) => part.replaceAll(/\s+/g, ' ').trim())
          .filter(Boolean);

        for (const part of parts) {
          if (/^email/gi.test(part)) {
            email = part.split(':')[1] ?? '';
          } else if (part.includes('@')) {
            email = part;
          } else if (/^department/gi.test(part)) {
            department = getDeptId(part);
          } else if (/^faculty\s*code/gi.test(part)) {
            fcode = part.split(':')[1] ?? '';
          }
        }
      });

      email = categorizeEmailByDomain(email) ?? '';
      fcode = fcode.trim();

      return {
        department,
        name,
        fcode,
        designation: '',
        room: '',
        building: '',
        telephone: '',
        email,
        status,
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
}
