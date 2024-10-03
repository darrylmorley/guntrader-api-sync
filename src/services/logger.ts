import logger from "pino";
import { join, normalize } from "path";

// Resolve the log location properly
const logLocation = normalize(join(import.meta.dir, "../logs/app.log"));

const customTimestamp = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-indexed
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `,"time":"${hours}:${minutes}:${seconds} ${day}-${month}-${year}"`;
};

const log = logger({
  transport: {
    targets: [
      {
        target: "pino-pretty", // Console logging with pretty printing
        options: { colorize: true },
        level: "info", // Set the log level for console
      },
      {
        target: "pino/file", // File logging
        options: {
          destination: logLocation,
        },
        level: "info", // Set the log level for file
      },
    ],
  },
  timestamp: customTimestamp,
});

export default log;
