const { createLogger, format, transports } = require("winston");
require("winston-daily-rotate-file");

const logFormat = format.combine(
  format.timestamp({
    format: () => new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
  }),
  format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
);

const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: [
    new transports.DailyRotateFile({
      filename: "combined-%DATE%.log",
      dirname: "./logs",
      datePattern: "DD-MM-YYYY",
      maxSize: "20m",
    }),
    new transports.DailyRotateFile({
      filename: "error-%DATE%.log",
      dirname: "./logs",
      datePattern: "DD-MM-YYYY",
      maxSize: "20m",
      level: "error",
    }),
    new transports.Console(),
  ],
});

module.exports = logger;