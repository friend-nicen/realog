/**
 * 日志模块
 * 负责监控日志文件并处理日志内容
 */

import fs from 'fs';
import path from 'path';
import config from '../config.js';
import {logInfo, logError, logWarn} from './console-logger.js';

/* 文件监控器 */
let fileWatcher = null;

/* 当前文件大小 */
let currentFileSize = 0;

/* 监控间隔 */
let monitorInterval = null;

/* 日志事件回调函数 */
let logCallbacks = {
    onLogData: null,
    onLogError: null,
    onLogClose: null
};

/**
 * 设置日志事件回调
 * @param {Object} callbacks - 回调函数对象
 * @param {Function} callbacks.onLogData - 接收到日志数据时的回调
 * @param {Function} callbacks.onLogError - 发生错误时的回调
 * @param {Function} callbacks.onLogClose - 日志进程关闭时的回调
 */
export function setLogCallbacks(callbacks) {
    logCallbacks = {...logCallbacks, ...callbacks};
}

/**
 * 启动文件监控
 * @returns {string|undefined} 日志文件路径，如果成功启动；undefined如果失败
 */
export function startTailProcess() {
    /* 如果已有监控，先关闭它 */
    if (fileWatcher || monitorInterval) {
        stopTailProcess();
    }

    /* 获取日志文件路径 */
    const logFilePath = config.getLogFilePath();

    /* 检查文件是否存在 */
    if (!fs.existsSync(logFilePath)) {
        logError(`日志文件不存在: ${logFilePath}`);

        /* 调用错误回调 */
        if (logCallbacks.onLogError) {
            logCallbacks.onLogError(`错误: 日志文件不存在 (${logFilePath})`);
        }

        return undefined;
    }

    try {
        /* 获取初始文件大小 */
        const stats = fs.statSync(logFilePath);
        currentFileSize = stats.size;

        /* 设置文件监控 */
        fileWatcher = fs.watch(logFilePath, (eventType) => {
            if (eventType === 'change') {
                readNewContent(logFilePath);
            }
        });

        /* 设置定时检查，以防文件监控事件丢失 */
        monitorInterval = setInterval(() => {
            readNewContent(logFilePath);
        }, config.updateInterval || 1000);

        logInfo(`开始监控日志文件: ${logFilePath}`);
        return logFilePath;
    } catch (error) {
        logError(`监控日志文件失败: ${error.message}`);
        
        /* 调用错误回调 */
        if (logCallbacks.onLogError) {
            logCallbacks.onLogError(`错误: 监控日志文件失败 (${error.message})`);
        }
        
        return undefined;
    }
}

/**
 * 读取文件新内容
 * @param {string} filePath - 文件路径
 */
function readNewContent(filePath) {
    try {
        const stats = fs.statSync(filePath);
        const newSize = stats.size;
        
        /* 如果文件大小变小，说明文件被截断，重新从头读取 */
        if (newSize < currentFileSize) {
            logWarn(`日志文件被截断，重新从头读取`);
            currentFileSize = 0;
        }
        
        /* 如果文件大小有变化，读取新内容 */
        if (newSize > currentFileSize) {
            const buffer = Buffer.alloc(newSize - currentFileSize);
            const fileDescriptor = fs.openSync(filePath, 'r');
            
            fs.readSync(fileDescriptor, buffer, 0, newSize - currentFileSize, currentFileSize);
            fs.closeSync(fileDescriptor);
            
            const newContent = buffer.toString();
            currentFileSize = newSize;
            
            /* 调用数据回调 */
            if (logCallbacks.onLogData) {
                logCallbacks.onLogData(newContent);
            }
        }
    } catch (error) {
        logError(`读取日志文件失败: ${error.message}`);
        
        /* 调用错误回调 */
        if (logCallbacks.onLogError) {
            logCallbacks.onLogError(`错误: 读取日志文件失败 (${error.message})`);
        }
    }
}

/**
 * 停止文件监控
 */
export function stopTailProcess() {
    if (fileWatcher) {
        fileWatcher.close();
        fileWatcher = null;
    }
    
    if (monitorInterval) {
        clearInterval(monitorInterval);
        monitorInterval = null;
    }
    
    currentFileSize = 0;
    logInfo('已停止日志监控');
}

/**
 * 获取当前监控的日志文件路径
 * @returns {string} 日志文件路径
 */
export function getCurrentLogFilePath() {
    return config.getLogFilePath();
}