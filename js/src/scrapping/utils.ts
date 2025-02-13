import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {logger} from '../index.js';
import {rootDir} from '../config.js';
import {logError} from '../utils.js';

/* eslint unicorn/prevent-abbreviations: "off" */
/**
 * Ensures a program-specific directory structure exists with date-based organization
 *
 * @param deptAlias - Alias of the department
 * @param dateStr - Optional date in YYYY-MM-DD format (defaults to current date)
 * @returns {Promise<string>} Promise resolving to the full path of the created directory
 * @throws {Error} If directory creation fails
 */
export async function ensureProgramDateDir(
  deptAlias: string,
  dateString = '',
): Promise<string> {
  dateString ||= new Date().toISOString().slice(0, 10);
  const fullPath = path.join(rootDir, deptAlias, dateString);

  try {
    await fs.mkdir(fullPath, {recursive: true});
    logger.info(`Successfully ensured folder (${fullPath})`, {
      alias: deptAlias,
    });
  } catch (error) {
    logError(`Failed to create folder (${fullPath})`, deptAlias, error);
    throw error;
  }

  return fullPath;
}

/**
 * Fetches HTML content from a URL and saves it to specified location
 *
 * @param deptAlias - Assigned alias of the program
 * @param url - URL to fetch
 * @param targetFilePath - Full path where HTML should be saved
 * @returns {Promise<boolean>} Promise resolving to true if content was saved, false if failed
 * @throws {Error} For network errors, or file system errors
 */
export async function fetchAndSaveHtml(
  deptAlias: string,
  url: string,
  targetFilePath: string,
): Promise<boolean> {
  try {
    logger.debug(`Fetching HTML from ${url}`, {alias: deptAlias});

    const response = await fetch(url);
    if (!response.ok) {
      logError(
        `Request failed with status ${response.status} (${url})`,
        deptAlias,
      );
      return false;
    }

    const dir = path.dirname(targetFilePath);
    await fs.mkdir(dir, {recursive: true});

    const content = await response.text();
    await fs.writeFile(targetFilePath, content);
    logger.debug(`Successfully saved HTML to ${targetFilePath}`, {
      alias: deptAlias,
    });
    return true;
  } catch (error) {
    logError(`Error processing HTML for ${url}`, deptAlias, error);
    return false;
  }
}

/**
 * Pauses execution for specified milliseconds with optional logging
 *
 * @param ms - Number of milliseconds to wait
 * @param context - Optional logging context (default: "http")
 * @returns Promise that resolves after the specified delay
 */
export async function delay(ms: number, context = 'http') {
  logger.debug(`Waiting ${ms}ms`, {context});
  await new Promise((resolve) => setTimeout(resolve, ms));
}
