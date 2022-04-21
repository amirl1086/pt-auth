const winston = require('winston');

//Create logger

const logFormat = winston.format.printf(({ level, message}) => {
  return `${level}: ${message}`;
});

// const logFormat = winston.format.printf(({ level, message, label, timestamp }) => {
//   return `${timestamp} [${label}] ${level}: ${message}`;
// });

const logger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'user-service' },
    transports: [
      // - Write all logs with importance level of `error` or less to `error.log`
      // - Write all logs with importance level of `info` or less to `combined.log`
      new winston.transports.File({ filename: 'error.log', level: 'error' , timestamp : true}),
      new winston.transports.File({ filename: 'debug.log'}), 
    ],
  });

  module.exports = {
    logger
}