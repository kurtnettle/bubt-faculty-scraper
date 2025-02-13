import {type ContactInfo} from '../../types.js';

/**
 * Cleans a phone number string by removing spaces and hyphens,
 * then splitting it into multiple numbers if separated by commas, slashes, or semicolons.
 *
 * @param {string} phone - Raw string containing potential phone number(s)
 * @returns {string|string[]|''} Cleaned number(s) or empty string if text contains invalid number
 *
 * @example
 * // Valid numbers
 * "+123-456 789" // "123456789"
 * "123-456 789" // "123456789"
 * "123,456;789" // ["123", "456", "789"]
 *
 * // Invalid case
 * "abc123" // ""
 */
export function validateAndSplitPhoneNumbers(
  phone: string,
): string | string[] | undefined {
  const cleanText = phone.replaceAll(/[ -]/g, ''); // Space and hyphen
  if (!/^\W?.\d+/gi.test(cleanText)) {
    return undefined;
  }

  const numbers = cleanText
    .split(/[,/;]+/)
    .map((s) => s.trim())
    .filter((number_) => /^\W?.\d+/gi.test(number_));

  if (numbers.length === 0) {
    return '';
  }

  return numbers.length === 1 ? numbers[0] : numbers;
}

/**
 * Creates a deep clone of the ContacInfo object and removes empty or falsy values, as well as empty arrays, from the cloned object.
 * A field is considered empty if it matches any of the following conditions:
 * - `null`
 * - `undefined`
 * - `false`
 * - An empty string (`""`)
 * - An empty array (`[]`)
 *
 *
 * @param {Object} data - The `ContactInfo` object to clean.
 * @returns {Object|null} - A new `ContactInfo` object with all empty or falsy fields removed.
 *                          If the input is nullish or not an object, the function returns `null`.
 *
 * @example
 * // Basic usage
 * cleanContactInfoEmptyFields({ personal: ["1234"], office: [], other: [] });
 * // Returns: { personal: ["1234"] }
 */
export function cleanContactInfoEmptyFields(
  data: ContactInfo | undefined,
): ContactInfo | undefined {
  if (!data) {
    return undefined;
  }

  const cleaned = structuredClone(data);

  for (const [key, value] of Object.entries(cleaned)) {
    if (!value || (Array.isArray(value) && value.length === 0)) {
      delete cleaned[key];
    }
  }

  if (Object.keys(cleaned).length > 0) {
    return cleaned;
  }
}

/**
 * Simplifies `ContactInfo` object by unwrapping single-element arrays.
 * If a field contains an array with exactly one element, the array is replaced with the element itself.
 *
 * @param data - `ContactInfo` object to simplify.
 * @returns The `ContactInfo` object or null if empty input is given.
 *
 * @example
 * // Basic usage
 * unwrapSingleElementArrays({personal: ["1234"], office: ["123","456"], other: []});
 * // Returns {personal: "1234", office: ["123","456"], other: []}
 */
export function simplifyContactInfo(
  data: ContactInfo | undefined,
): ContactInfo | undefined {
  // I, at first, was returning null but https://github.com/sindresorhus/meta/discussions/7
  if (!data) {
    return undefined;
  }

  const flattened = {...data};

  for (const value of Object.keys(flattened) as Array<keyof ContactInfo>) {
    const _value = flattened[value];
    if (Array.isArray(_value) && _value.length === 1) {
      flattened[value] = _value[0];
    }
  }

  return flattened;
}
