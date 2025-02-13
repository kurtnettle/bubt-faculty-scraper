import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {rootDir} from '../../config.js';
import {logError} from '../../utils.js';

/**
 * Lists snapshot folder names for a given department, sorted in reverse natural order.
 * If the directory cannot be accessed (e.g., does not exist or permission denied), an
 * empty array is returned after logging the error.
 *
 * @param {string} deptAlias - Alias of the department to inspect.
 * @returns {Promise<string[]>} Array of directory names sorted in reverse.
 */
export async function getSnapshotDates(deptAlias: string) {
  const progDataDir = path.join(rootDir, deptAlias);

  try {
    const directories = await fs.readdir(progDataDir, {
      withFileTypes: true,
    });
    return directories
      .filter((dir) => dir.isDirectory())
      .map((dir) => dir.name)
      .reverse();
  } catch (error) {
    logError('Failed to list snapshot dates', deptAlias, error);
    return [];
  }
}
