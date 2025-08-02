/**
 * WebSocket模块
 * 负责处理WebSocket连接和消息广播
 */

import {WebSocket, WebSocketServer} from 'ws';
import config from '../config.js';
import {logInfo} from './console-logger.js';
import path from "path";

/* 存储所有WebSocket连接 */
const clients = new Set();

/* WebSocket服务器实例 */
let wss = null;

/**
 * 初始化WebSocket服务器
 */
export function initWebSocketServer() {
    /* 创建WebSocket服务器 */
    wss = new WebSocketServer({port: config.wsPort});

    wss.on('connection', (ws) => {
        /* 添加新客户端到集合 */
        clients.add(ws);
        logInfo(`新的WebSocket连接，当前连接数: ${clients.size}`);

        /* 发送欢迎消息 */
        ws.send(`已连接到日志服务器，正在监控: ${path.basename(config.getLogFilePath())}\n`);

        /* 监听连接关闭 */
        ws.on('close', () => {
            clients.delete(ws);
            logInfo(`WebSocket连接已关闭，当前连接数: ${clients.size}`);
        });
    });

    logInfo(`WebSocket服务器已启动，端口: ${config.wsPort}`);
    return wss;
}

/**
 * 向所有WebSocket客户端广播消息
 * @param {string} message - 要广播的消息
 */
export function broadcastMessage(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

/**
 * 关闭WebSocket服务器
 */
export function closeWebSocketServer() {
    if (wss) {
        wss.close(() => {
            logInfo('WebSocket服务器已关闭');
        });
    }
}

/**
 * 获取当前连接的客户端数量
 * @returns {number} 客户端数量
 */
export function getClientCount() {
    return clients.size;
}