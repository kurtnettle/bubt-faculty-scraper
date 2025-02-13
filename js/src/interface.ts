import type * as cheerio from 'cheerio';
import {type FacultyInfo} from './types.js';

export type CustomExtractor = {
  parseProfilePage: (filePath: string) => Promise<FacultyInfo | undefined>;
  parseProfileCard: (
    bs4: cheerio.CheerioAPI,
    element: Element,
  ) => FacultyInfo | undefined;
};

export type Config = {
  rootDir: string;
  requestDelayMs: number;
};
