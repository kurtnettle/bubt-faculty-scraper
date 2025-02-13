import type * as cheerio from 'cheerio';

/**
 * Retrieves trimmed text content from a DOM element using a CSS selector
 * inspired from python bs4
 *
 * @param {string} selector - CSS selector to search for within the context
 * @param {cheerio.Cheerio<unknown>} context - Cheerio instance to use for find
 * @returns {string} Trimmed text content of the first matching element or empty string if not found
 */
export function getText(
  selector: string,
  context: cheerio.Cheerio<unknown>,
): string {
  return context.find(selector).text().trim();
}

export function parseRoomAndBuilding(text: string) {
  const cleanedText = text.replaceAll(/-|bubt/gi, '');
  const [roomTxt, buildingTxt] = cleanedText
    .split(',')
    .map((s) => s.replaceAll(/.*(room|building)/gi, ''));

  const extractParts = (string_: string) =>
    string_
      .split(':')
      .map((p) => p.trim().replaceAll(/[/\W]/g, ','))
      .filter(Boolean);

  const roomParts = extractParts(roomTxt);
  const buildingParts = extractParts(buildingTxt);
  const processedParts = roomParts
    .concat(buildingParts)
    .flatMap((p) => p.split(','));

  const result = {room: '', building: ''};
  for (const part of processedParts) {
    if (/\d{3}/g.test(part)) {
      result.room = part;
    } else {
      result.building = part.replaceAll(/^b/gi, '');
    }
  }

  return result;
}
