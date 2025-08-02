/**
 * 实时日志查看器前端脚本
 */

/* 获取DOM元素 */
const logContent = document.getElementById('logContent');
const statusElement = document.getElementById('status');
const logPathElement = document.getElementById('logPath');
const lineCountElement = document.getElementById('lineCount');
const terminalBody = document.querySelector('.terminal-body');
const clearBtn = document.getElementById('clearBtn');
const restartBtn = document.getElementById('restartBtn');
const pauseBtn = document.getElementById('pauseBtn');

/* 配置和状态 */
let config = {
    maxLines: 1000,
    logFilePath: ''
};

let state = {
    isPaused: false,
    isConnected: false,
    buffer: [],
    isMobile: false
};

/* 检测是否为移动设备 */
function detectMobile() {
    state.isMobile = window.innerWidth <= 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('设备类型:', state.isMobile ? '移动设备' : '桌面设备');
}

/* WebSocket连接 */
let ws = null;

/**
 * 初始化应用
 */
async function init() {
    /* 检测设备类型 */
    detectMobile();
    
    /* 获取配置 */
    try {
        const response = await fetch('/api/config');
        config = await response.json();
        logPathElement.textContent = `日志文件: ${config.logFilePath}`;
        
        /* 在移动设备上截断显示的日志路径 */
        if (state.isMobile && config.logFilePath.length > 20) {
            const path = config.logFilePath;
            const shortPath = '...' + path.substring(path.length - 20);
            logPathElement.textContent = `日志: ${shortPath}`;
            logPathElement.title = config.logFilePath; // 添加完整路径作为提示
        }
    } catch (error) {
        console.error('获取配置失败:', error);
        updateStatus('获取配置失败', true);
    }
    
    /* 初始化WebSocket连接 */
    initWebSocket();
    
    /* 初始化事件监听器 */
    initEventListeners();
    
    /* 监听窗口大小变化 */
    window.addEventListener('resize', handleResize);
}

/**
 * 初始化WebSocket连接
 */
function initWebSocket() {

    /* 获取WebSocket服务器地址 */
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsPort = 8080; /* 与服务器端配置保持一致 */
    const wsUrl = `${protocol}//${host}:${wsPort}`;
    
    /* 创建WebSocket连接 */
    ws = new WebSocket(wsUrl);
    
    /* 连接打开时的处理 */
    ws.onopen = () => {
        state.isConnected = true;
        updateStatus('已连接');
        console.log('WebSocket连接已建立');
    };
    
    /* 接收消息的处理 */
    ws.onmessage = (event) => {
        if (!state.isPaused) {
            appendLog(event.data);
        } else {
            /* 如果暂停状态，将消息存入缓冲区 */
            state.buffer.push(event.data);
        }
    };
    
    /* 连接关闭时的处理 */
    ws.onclose = () => {
        state.isConnected = false;
        updateStatus('连接已断开', true);
        console.log('WebSocket连接已关闭，5秒后尝试重新连接...');
        
        /* 5秒后尝试重新连接 */
        setTimeout(initWebSocket, 5000);
    };
    
    /* 错误处理 */
    ws.onerror = (error) => {
        console.error('WebSocket错误:', error);
        updateStatus('连接错误', true);
    };
}

/**
 * 处理窗口大小变化
 */
function handleResize() {
    detectMobile();
    
    /* 更新日志路径显示 */
    if (state.isMobile && config.logFilePath.length > 20) {
        const path = config.logFilePath;
        const shortPath = '...' + path.substring(path.length - 20);
        logPathElement.textContent = `日志: ${shortPath}`;
    } else {
        logPathElement.textContent = `日志文件: ${config.logFilePath}`;
    }
}

/**
 * 初始化事件监听器
 */
function initEventListeners() {
    /* 清空按钮点击事件 */
    clearBtn.addEventListener('click', () => {
        logContent.textContent = '';
        updateLineCount(0);
        console.log('日志已清空');
    });
    
    /* 重启按钮点击事件 */
    restartBtn.addEventListener('click', async () => {
        try {
            updateStatus('正在重启日志监控...');
            const response = await fetch('/api/restart', {
                method: 'POST'
            });
            const result = await response.json();
            
            if (result.success) {
                updateStatus('日志监控已重启');
                const newPath = result.message.split(': ')[1];
                config.logFilePath = newPath;
                
                /* 在移动设备上截断显示的日志路径 */
                if (state.isMobile && newPath.length > 20) {
                    const shortPath = '...' + newPath.substring(newPath.length - 20);
                    logPathElement.textContent = `日志: ${shortPath}`;
                    logPathElement.title = newPath; // 添加完整路径作为提示
                } else {
                    logPathElement.textContent = `日志文件: ${newPath}`;
                }
            } else {
                updateStatus('重启失败: ' + result.message, true);
            }
        } catch (error) {
            console.error('重启请求失败:', error);
            updateStatus('重启请求失败', true);
        }
    });
    
    /* 暂停/继续按钮点击事件 */
    pauseBtn.addEventListener('click', () => {
        state.isPaused = !state.isPaused;
        
        if (state.isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
            updateStatus('已暂停', false, true);
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> 暂停';
            updateStatus('已连接');
            
            /* 处理缓冲区中的消息 */
            if (state.buffer.length > 0) {
                state.buffer.forEach(message => appendLog(message));
                state.buffer = [];
            }
        }
    });
    
    /* 为移动设备添加触摸事件支持 */
    if ('ontouchstart' in window) {
        let touchStartY = 0;
        let scrollStartPos = 0;
        
        logContent.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            scrollStartPos = logContent.scrollTop;
        }, { passive: true });
        
        logContent.addEventListener('touchmove', (e) => {
            const touchY = e.touches[0].clientY;
            const diff = touchStartY - touchY;
            logContent.scrollTop = scrollStartPos + diff;
        }, { passive: true });
    }
}

/**
 * 添加日志到显示区域
 * @param {string} message - 日志消息
 */
function appendLog(message) {

    /* 添加新内容 */
    logContent.textContent += message;
    
    /* 限制最大行数 */
    const lines = logContent.textContent.split('\n');
    
    /* 在移动设备上减少最大行数以提高性能 */
    const effectiveMaxLines = state.isMobile ? Math.floor(config.maxLines / 2) : config.maxLines;
    
    if (lines.length > effectiveMaxLines) {
        logContent.textContent = lines.slice(lines.length - effectiveMaxLines).join('\n');
    }
    
    /* 更新行数统计 */
    updateLineCount(lines.length - 1); // 减去最后一个空行
    
    /* 自动滚动到底部 */
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

/**
 * 更新状态显示
 * @param {string} message - 状态消息
 * @param {boolean} isError - 是否为错误状态
 * @param {boolean} isPaused - 是否为暂停状态
 */
function updateStatus(message, isError = false, isPaused = false) {
    statusElement.textContent = message;
    statusElement.className = 'status';
    
    if (isError) {
        statusElement.classList.add('error');
    } else if (isPaused) {
        statusElement.classList.add('paused');
    }
}

/**
 * 更新行数统计
 * @param {number} count - 行数
 */
function updateLineCount(count) {
    lineCountElement.textContent = `${count} 行`;
}

/* 页面加载完成后初始化应用 */
document.addEventListener('DOMContentLoaded', init);