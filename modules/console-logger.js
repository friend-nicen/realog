/**
 * 控制台日志封装模块
 * 为控制台日志增加时间输出
 */

/* 日志级别 */
const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

/**
 * 获取当前时间格式化字符串
 * @returns {string} 格式化的时间字符串 [YYYY-MM-DD HH:MM:SS]
 */
function getFormattedTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}]`;
}

/**
 * 格式化日志消息
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @returns {string} 格式化后的日志消息
 */
function formatLogMessage(level, message) {
  return `${getFormattedTime()} [${level}] ${message}`;
}

/**
 * 信息日志
 * @param {string} message - 日志消息
 */
export function logInfo(message) {
  console.log(formatLogMessage(LogLevel.INFO, message));
}

/**
 * 警告日志
 * @param {string} message - 日志消息
 */
export function logWarn(message) {
  console.warn(formatLogMessage(LogLevel.WARN, message));
}

/**
 * 错误日志
 * @param {string} message - 日志消息
 */
export function logError(message) {
  console.error(formatLogMessage(LogLevel.ERROR, message));
}

/**
 * 调试日志
 * @param {string} message - 日志消息
 */
export function logDebug(message) {
  console.debug(formatLogMessage(LogLevel.DEBUG, message));
}

/* 导出日志级别 */
export { LogLevel };