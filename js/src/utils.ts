import {type Logger} from 'winston';
import {logger} from './index.js';

export function logError(
  message: string,
  alias: string | undefined = undefined,
  error: unknown | undefined = undefined,
  childLogger: Logger | undefined = undefined,
) {
  const baseMeta = childLogger ? {} : {alias};

  let errorMeta = {};
  let logMessage = message;

  if (error instanceof Error) {
    logMessage = message || 'Error occurred';
    errorMeta = {
      error: error.message,
      stack: error.stack,
    };
  } else if (error !== undefined) {
    logMessage = message || 'Unknown error occurred';
    errorMeta = {
      error: String(error),
    };
  }

  const meta = {...baseMeta, ...errorMeta};
  const loggerToUse = childLogger ?? logger;

  loggerToUse.error(logMessage, meta);
}
