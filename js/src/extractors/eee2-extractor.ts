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
  simplifyContactInfo,
  parseRoomAndBuilding,
} from './utils/index.js';

export type ContactData = {
  email?: ContactInfo;
  phone?: ContactInfo;
  room?: string;
  building?: string;
};

/**
 * A custom extractor for `https://eee.bubt.edu.bd/faculty-members`.
 * Implements the `CustomExtractor` interface to define extraction logic.
 */
export class Eee2Extractor implements CustomExtractor {
  private readonly childLogger = logger.child({alias: 'eee2'});

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

      const table = bs4('tbody#members_list');

      const department = getDeptId('electronic');

      const nameText = getText(
        'tr:nth-child(2) > td:nth-child(2) > strong',
        table,
      );
      const [nameAndFcode, designationAndStatus] = nameText.split(',');
      const name = nameAndFcode.replaceAll(/\s*\([^)]*\)/g, '').trim();
      const designation = designationAndStatus
        .replaceAll(/\s*\([^)]*\)/g, '')
        .trim();

      const match = /\(([^)]+)\)/.exec(nameAndFcode);
      const fcode = (match ? match[1] : '').trim();

      const match0 = /\(([^)]+)\)/.exec(designationAndStatus);
      const status = (match0 ? match0[1] : '').trim();

      const contactRowText =
        table.find('tr:last-child > td:nth-child(2)').text() ?? '';
      const parsedContact = this.parseProfilePageContactCell(contactRowText);

      return {
        department,
        name,
        fcode,
        designation,
        room: parsedContact.room ?? '',
        building: parsedContact.building ?? '',
        telephone: parsedContact.phone ?? '',
        email: parsedContact.email ?? '',
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

      const profileUrl = element
        .find('div.person_specialization > p > a')
        .attr('href');

      const department = getDeptId('electronic');

      let fcode = getText('div.person_text > h4 > small', element);
      fcode = fcode.replaceAll(/\(|\)/g, '');

      const name = element
        .find('div.person_text > h4')
        .contents()
        .first()
        .text()
        .trim();

      const spanText = getText('div.person_text > h4 > span', element);
      const designation = spanText.replaceAll(/\s*\([^)]*\)/g, '').trim();

      const match = /\(([^)]+)\)/.exec(spanText);
      const status = (match ? match[1] : '').trim();

      return {
        department,
        name,
        fcode,
        designation,
        room: '', // Extracted from page, unavailable at card
        building: '', // Extracted from page, unavailable at card
        telephone: '', // Extracted from page, unavailable at card
        email: '', // Extracted from page, unavailable at card
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

  private cleanEmptyContactField(data: ContactData): ContactData {
    const cleaned = structuredClone(data);

    for (const category of ['email', 'phone'] as const) {
      cleaned[category] = cleanContactInfoEmptyFields(cleaned[category]);
    }

    return cleaned;
  }

  private unwrapSingleContactElementArrays(data: ContactData): ContactData {
    const cleaned = {...data};

    for (const category of ['email', 'phone'] as const) {
      cleaned[category] = simplifyContactInfo(cleaned[category]);
    }

    return cleaned;
  }

  private parseProfilePageContactCell(text: string): ContactData {
    const contactRowLines = text
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);

    const fieldMappings: Record<string, string> = {
      office: 'room',
      phone: 'phone',
      mobile: 'phone',
      cellphone: 'pp',
      officephone: 'op',
      email: 'email',
      'e-mail': 'email',
      'officiale-mail': 'oe',
      'personale-mail': 'pe',
    };

    const data = {
      room: '',
      building: '',
      email: {
        personal: [],
        office: [],
        other: [],
      },
      phone: {
        personal: [],
        office: [],
        other: [],
      },
    };

    for (const line of contactRowLines) {
      if (!line.includes(':')) {
        this.childLogger.debug(`Invalid line format, missing colon: ${line}`);
        continue;
      }

      const [key, value] = line.split(':').map((x) => x.replaceAll(' ', ''));
      if (!value) {
        continue;
      }

      const fieldKey = key.trim().toLowerCase();
      const fieldType = fieldMappings[fieldKey];
      if (!fieldType) {
        this.childLogger.debug(`Unrecognized field: <${fieldKey}>`);
        continue;
      }

      switch (fieldType) {
        case 'room': {
          const {room, building} = parseRoomAndBuilding(value);
          if (room) {
            data.room = room;
          }

          if (building) {
            data.building = building;
          }

          break;
        }

        case 'pe': {
          data.email?.personal?.push(value);
          break;
        }

        case 'oe': {
          data.email?.office?.push(value);
          break;
        }

        case 'email': {
          data.email?.other?.push(value);
          break;
        }

        case 'pp': {
          data.phone?.personal?.push(validateAndSplitPhoneNumbers(value));
          break;
        }

        case 'op': {
          data.phone?.office?.push(validateAndSplitPhoneNumbers(value));
          break;
        }

        case 'phone': {
          data.phone?.other?.push(validateAndSplitPhoneNumbers(value));
          break;
        }

        default: {
          this.childLogger.debug(`Failed to handle: ${key}, ${value}`);
          break;
        }
      }
    }

    return this.cleanEmptyContactField(data);
  }
}
