import logger from "pino";
import { join, normalize } from "path";

// Resolve the log location properly
const logLocation = normalize(join(import.meta.dir, "../logs/app.log"));

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
          translateTime: "SYS:dd-mm-yyyy HH:MM:ss",
        },
        level: "info", // Set the log level for file
      },
    ],
  },
});

export default log;
