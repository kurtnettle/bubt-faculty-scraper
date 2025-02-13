import {access, readFile} from 'node:fs/promises';
import * as path from 'node:path';
import * as cheerio from 'cheerio';
import {type ExtractionConfig} from '../types.js';
import {logger, scraperConfigs} from '../index.js';
import {requestDelayMs} from '../config.js';
import {logError} from '../utils.js';
import {ensureProgramDateDir, delay, fetchAndSaveHtml} from './utils.js';

/**
 * Extracts faculty member profile links from the webpage and
 * downloads corresponding profile pages using the provided extraction configuration.
 *
 * @param {ExtractionConfig} config - The configuration settings for faculty profile extraction and download.
 * @returns {Promise<void>} - A promise that resolves when both extraction and download processes are complete.
 */
export async function extractAndDownloadFaculties(
  config: ExtractionConfig,
): Promise<void> {
  const childLogger = logger.child({alias: config.alias});
  const folderPath = await ensureProgramDateDir(config.alias);

  const facultyListHtml = path.join(
    folderPath,
    `${config.alias.toLowerCase()}.html`,
  );
  childLogger.info(`Downloading faculty list page: ${facultyListHtml}`);

  const status = await fetchAndSaveHtml(
    config.alias,
    config.baseUrl,
    facultyListHtml,
  );

  if (status) {
    childLogger.info('Downloaded faculty list page successfully.');
  } else {
    childLogger.info('Failed to download faculty list page.');
    return;
  }

  try {
    const htmlContent = await readFile(facultyListHtml, 'utf8');
    const $ = cheerio.load(htmlContent);

    const facultyMembers = $(config.facultyListClass).toArray();
    if (facultyMembers.length === 0) {
      childLogger.warn('No faculty members found.');
      return;
    }

    childLogger.info(`Found ${facultyMembers.length} faculty members.`);

    for (const element of facultyMembers) {
      const profUrl = $(element).find(config.profileUrlClass).attr('href');

      if (!profUrl) {
        childLogger.warn('Faculty member has no profile link.');
        continue;
      }

      const fileName = profUrl.split('/').findLast(Boolean);
      if (!fileName) {
        childLogger.warn(`Unable to determine filename from URL: ${profUrl}`);
        continue;
      }

      const filePath = `${folderPath}/${fileName}.html`;

      try {
        await access(filePath);
        childLogger.info(`Already downloaded: ${filePath}`);
      } catch {
        try {
          await fetchAndSaveHtml(
            config.alias,
            config.urlSuffix ? `${config.urlSuffix}/${fileName}/` : profUrl,
            filePath,
          );

          childLogger.info(`Downloaded: ${filePath}`);
          await delay(requestDelayMs);
        } catch (error) {
          logError(
            `Error downloading ${profUrl}`,
            undefined,
            error,
            childLogger,
          );
        }
      }
    }
  } catch (error) {
    logError('Error processing faculty pages', undefined, error, childLogger);
  }

  childLogger.info('Downloaded all faculty members.');
}

/**
 * One shot kill version of extractAndDownloadFacultyProfiles()
 *
 * @returns {Promise<void>} A promise that resolves once the dumping process is complete.
 */
export async function dumpAllDeptFaculty(): Promise<void> {
  for (const [alias, config] of scraperConfigs) {
    await extractAndDownloadFaculties(config);
  }
}
