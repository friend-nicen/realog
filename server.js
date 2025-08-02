import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';

/* 导入模块 */
import {
  startTailProcess,
  setLogCallbacks,
  initWebSocketServer,
  broadcastMessage,
  initHttpServer,
  logInfo,
  logError,
  logWarn,
  logDebug
} from './modules/index.js';

/* 获取当前文件的目录路径 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* 设置日志回调函数 */
setLogCallbacks({
  onLogData: (data) => {
    /* 向所有客户端广播日志数据 */
    broadcastMessage(data);
  },
  onLogError: (error) => {
    /* 向所有客户端广播错误消息 */
    broadcastMessage(error);
  },
  onLogClose: (code) => {
    logInfo(`日志监控已关闭，退出码: ${code}`);
  }
});

/* 初始化WebSocket服务器 */
initWebSocketServer();

/* 初始化HTTP服务器 */
initHttpServer();

/* 启动日志监控 */
startTailProcess();

logInfo('实时日志系统已启动');