import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as cheerio from 'cheerio';
import {type ExtractionConfig, type FacultyInfo} from '../../types.js';
import {logger, scraperConfigs} from '../../index.js';
import {type CustomExtractor} from '../../interface.js';
import {
  Cse2Extractor,
  Eee2Extractor,
  GeneralExtractor,
} from '../../extractors/index.js';
import {DepartmentAlias} from '../../constants.js';
import {rootDir} from '../../config.js';
import {logError} from '../../utils.js';
import {getSnapshotDates} from './folder-utils.js';

/**
 * Merges data from `cardData` and `pageData` objects.
 * If a field in `cardData` is falsy, it is replaced with the corresponding value from `pageData`.
 * Only the top-level fields of the objects are merged; deeply nested fields are not compared or merged.
 *
 * @param {FacultyInfo} cardData - The primary data object, containing initial values.
 * @param {FacultyInfo} pageData - The secondary data object, used to fill missing or falsy values in `cardData`.
 * @returns {FacultyInfo} - A new object that combines data from `cardData` and `pageData`.
 */
export function mergeCardAndPageData(
  cardData: FacultyInfo,
  pageData: FacultyInfo,
): FacultyInfo {
  const data = {...cardData};

  for (const field of Object.keys(cardData)) {
    if (!cardData[field] || cardData[field] === '') {
      const pd = pageData[field];
      if (pd) {
        logger.debug(`${field}: filled from page (${cardData[field]} > ${pd})`);
        data[field] = pd;
      }
    }
  }

  return data;
}

function getFacultyPageIdFromUrl(text: string | undefined): string | undefined {
  if (!text) {
    return;
  }

  return text.split('/').findLast(Boolean);
}

/**
 * Extracts faculty data from HTML files and saves it as a JSON file.
 *
 * @async
 * @function extractFacultyData
 * @param {Object} config - Department-specific extraction configuration
 * @param {string} dateString - Snapshot date in YYYY-MM-DD format for versioning
 * @param {CustomExtractor} [extractor] - Optional custom extraction logic. Auto-detected if not provided
 * @param {string} [outputDir] - Optional directory path where the output JSON file will be saved.
 * @returns {Promise<void>} - A promise that resolves when the extraction and file writing are complete.
 * @throws {Error} - Throws an error if any critical operation fails (e.g., file reading, writing, parsing).
 */
export async function extractFacultyData(
  config: ExtractionConfig,
  dateString: string,
  extractor?: CustomExtractor,
  outputDir?: string,
) {
  const childLogger = logger.child({alias: config.alias});

  if (!extractor) {
    childLogger.debug(
      "Extractor class wasn't provided. Determining based on alias",
    );
    extractor = getCustomExtractorInstance(config);
  }

  childLogger.info(`Using the dump created at ${dateString}`);

  const startTime = performance.now();
  childLogger.info('Started faculty extraction');

  const faculties = new Array<FacultyInfo>();
  const progDataDir = path.join(rootDir, config.alias, dateString);

  const htmlPath = path.join(progDataDir, `${config.alias.toLowerCase()}.html`);
  const htmlContent = await fs.readFile(htmlPath, 'utf8');
  const $ = cheerio.load(htmlContent);

  const facultyMembers = $(config.facultyListClass).toArray();
  childLogger.info(`Found ${facultyMembers.length} faculties`);

  for (const element of facultyMembers) {
    const cardData = extractor.parseProfileCard($, element);
    if (!cardData) {
      childLogger.error('Failed to extract data from faculty card.');
      continue;
    }

    const profileId = getFacultyPageIdFromUrl(cardData?.profileUrl);
    const profileHtmlPath = path.join(progDataDir, `${profileId}.html`);
    const pageData = await extractor.parseProfilePage(profileHtmlPath);

    if (!pageData) {
      childLogger.error(
        `[${cardData.fcode}] : Failed to extract data from faculty page.`,
      );

      faculties.push(cardData);
      continue;
    }

    faculties.push(mergeCardAndPageData(cardData, pageData));
  }

  const endTime = performance.now();
  const elapsed = (endTime - startTime) / 1000;

  childLogger.info(`Finished extracting (${elapsed.toFixed(2)}s)`);

  const outFileLocation = outputDir
    ? path.join(outputDir, `${config.alias}-${dateString}.json`)
    : path.join(progDataDir, `${config.alias}.json`);

  await fs.writeFile(outFileLocation, JSON.stringify(faculties));

  childLogger.info(`Written data to ${outFileLocation}`);
}

/**
 * Returns an instance of a custom extractor based on the provided configuration.
 * The returned extractor is determined by the `alias` field in the `config` object.
 *
 * @param config The scraper configuration object of the department.
 * @returns {CustomExtractor} A custom extractor instance based on the provided `config` alias.
 */

export function getCustomExtractorInstance(
  config: ExtractionConfig,
): CustomExtractor {
  switch (config.alias) {
    case DepartmentAlias.cse2: {
      return new Cse2Extractor();
    }

    case DepartmentAlias.eee2: {
      return new Eee2Extractor();
    }

    default: {
      return new GeneralExtractor(config.alias);
    }
  }
}

/**
 * Extracts faculty data for multiple departments using
 * department-specific extractors from downloaded webpages.
 *
 * @param {string} [outputDir] - Optional directory path where the output JSON file will be saved.
 */
export async function extractAllDeptFaculties(outputDir?: string) {
  const total = scraperConfigs.size;
  let done = 0;

  logger.info(`Starting extraction of ${total} departments`);
  for (const [alias, config] of scraperConfigs) {
    try {
      const directories = await getSnapshotDates(config.alias);
      if (directories.length === 0) {
        logError('No snapshot folder found', config.alias);
        continue;
      }

      await extractFacultyData(config, directories[0], undefined, outputDir);
      done += 1;
    } catch (error) {
      logError('Extraction failed', config.alias, error);
    }
  }

  logger.info(`Extracted faculties from ${done}/${total} departments`);
}
