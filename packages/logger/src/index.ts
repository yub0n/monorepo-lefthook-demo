import { formatMessage } from "./formatter";

export const logInfo = (message: string): void => {
  console.log(formatMessage("INFO", message));
};

export const logError = (message: string): void => {
  console.error(formatMessage("ERROR", message));
};

