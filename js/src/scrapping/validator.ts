import {logger} from '../index.js';
import {Department, DepartmentAlias} from '../constants.js';
import {type ExtractionConfig} from '../types.js';

// https://stackoverflow.com/questions/43804805/check-if-value-exists-in-enum-in-typescript
const isValidEnumValue = <T extends Record<string, unknown>>(
  value: unknown,
  enumType: T,
): value is T[keyof T] => Object.values(enumType).includes(value as T[keyof T]);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

const isValidUrl = (value: string): boolean => {
  try {
    /* eslint no-new: "off" */
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate an extraction config
 *
 * @param config
 * @returns
 */
export function validateExtractionConfig(
  config: unknown,
): config is ExtractionConfig {
  if (typeof config !== 'object' || config === null) {
    console.error('Invalid config: Must be a non-null object');
    return false;
  }

  const requiredKeys: Array<keyof ExtractionConfig> = [
    'alias',
    'progName',
    'baseUrl',
  ];

  for (const key of requiredKeys) {
    if (!(key in config)) {
      console.error(`Missing required field: ${key}`);
      return false;
    }
  }

  const cfg = config as Partial<ExtractionConfig>;

  // Validate alias
  if (!isValidEnumValue(cfg.alias, DepartmentAlias)) {
    console.error(
      `Invalid alias: Must be one of ${Object.values(DepartmentAlias).join(', ')}`,
    );
    return false;
  }

  // Validate progName
  if (!isValidEnumValue(cfg.progName, Department)) {
    console.error(
      `Invalid progName: Must be one of ${Object.values(Department).join(', ')}`,
    );
    return false;
  }

  // Validate baseUrl
  if (!isNonEmptyString(cfg.baseUrl) || !isValidUrl(cfg.baseUrl)) {
    console.error(
      `Invalid baseUrl: Must be a valid URL (received '${cfg.baseUrl}')`,
    );
    return false;
  }

  // Validate urlSuffix
  if (cfg.urlSuffix !== undefined && !isNonEmptyString(cfg.urlSuffix)) {
    console.error('urlSuffix is not provided.');
  }

  // Validate facultyListClass
  if (!isNonEmptyString(cfg.facultyListClass)) {
    console.warn(
      'facultyListClass selector is not provided. Will use the default one',
    );
  }

  // Validate profileUrlClass
  if (!isNonEmptyString(cfg.profileUrlClass)) {
    console.warn(
      'profileUrlClass selector is not provided. Will use the default one',
    );
  }

  return true;
}
