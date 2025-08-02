/**
 * HTTP服务模块
 * 负责处理HTTP请求和API端点
 */

import {Hono} from 'hono';
import {serve} from '@hono/node-server';
import {serveStatic} from '@hono/node-server/serve-static';
import config from '../config.js';
import {startTailProcess, getCurrentLogFilePath} from './logger.js';
import {logInfo} from './console-logger.js';
import path from "path";

/* 创建Hono应用 */
const app = new Hono();

/**
 * 初始化HTTP服务器
 */
export function initHttpServer() {
    /* 设置静态文件服务 */
    app.use('/*', serveStatic({root: './public'}));

    /* 重启tail进程的API端点 */
    app.post('/api/restart', async (c) => {
        const logFilePath = startTailProcess();
        return c.json({
            success: !!logFilePath,
            message: logFilePath ?
                `已重新启动日志监控: ${logFilePath}` :
                '重启日志监控失败'
        });
    });

    /* 获取当前配置的API端点 */
    app.get('/api/config', (c) => {
        return c.json({
            logFilePath: path.basename(getCurrentLogFilePath()),
            maxLines: config.maxLines
        });
    });

    /* 启动HTTP服务器 */
    const server = serve({
        fetch: app.fetch,
        port: config.httpPort
    }, (info) => {
        logInfo(`HTTP服务器已启动: http://localhost:${info.port}`);
    });

    return server;
}

/**
 * 获取Hono应用实例
 * 用于测试或扩展
 */
export function getApp() {
    return app;
}