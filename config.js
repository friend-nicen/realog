/**
 * 配置文件
 */

export default {
  /**
   * 获取日志文件路径的函数
   * 可以根据需要修改此函数来动态获取日志文件路径
   * @returns {string} 日志文件路径
   */
  getLogFilePath: () => {
    /* 默认日志文件路径，可以根据实际情况修改 */
    return process.env.LOG_FILE_PATH || 'D:\\web\\reallog\\test.log';
  },
  
  /**
   * WebSocket服务器端口
   */
  wsPort: 8080,
  
  /**
   * HTTP服务器端口
   */
  httpPort: 3000,
  
  /**
   * 日志更新间隔（毫秒）
   */
  updateInterval: 1000,
  
  /**
   * 最大显示行数
   */
  maxLines: 1000
};