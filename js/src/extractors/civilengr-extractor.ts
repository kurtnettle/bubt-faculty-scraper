import type * as cheerio from 'cheerio';
import {type FacultyInfo} from '../types.js';
import {GeneralExtractor} from './general-extractor.js';

/**
 * A custom extractor for `https://www.bubt.edu.bd/home/faculty_member/civil-engineering`.
 * Extends the `GeneralExtractor` class to modify extraction logic.
 */
export class CivilEngrExtractor extends GeneralExtractor {
  public parseProfileCard(
    bs4: cheerio.CheerioAPI,
    element_: Element,
  ): FacultyInfo | undefined {
    const result = super.parseProfileCard(bs4, element_);

    // Parse fcode from the profile page.
    if (result) result.fcode = '';

    return result;
  }
}
