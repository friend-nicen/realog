# RealLog - 实时日志查看系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)](https://nodejs.org/)

RealLog 是一个基于 WebSocket 和 HTTP 的实时日志查看系统，允许用户通过浏览器实时监控服务器上的日志文件变化。系统提供了美观的终端风格界面，支持移动设备自适应，并具有日志暂停、清空、重启等功能。

演示地址：<https://realog.nicen.cn>，实时查看服务器上日志文件的变化

## 功能特点

- **实时监控**：通过 WebSocket 实时推送日志更新
- **文件监控**：自动检测日志文件变化，支持文件被截断的情况
- **配置灵活**：可自定义日志文件路径、最大显示行数等

### 安装步骤

#### 1. 克隆仓库

```bash
git clone https://github.com/friend-nicen/realog.git
cd realog
```

#### 2. 安装依赖

```bash
npm i -D
```

#### 3. 打包

通过rollup将项目打包成单个文件

```bash
npm run build
```

## 使用方法

### 启动服务

```bash
npm start
```

或者使用开发模式（自动重启）：

```bash
npm run dev
```

启动后，服务器将在以下地址运行：

- HTTP 服务器：http://localhost:3000
- WebSocket 服务器：ws://localhost:8080

### 配置选项

编辑 `config.js` 文件可以修改以下配置：

```javascript
export default {
    // 获取日志文件路径的函数
    getLogFilePath: () => {
        // 默认日志文件路径，可以根据实际情况修改
        return process.env.LOG_FILE_PATH || '/path/to/your/logfile.log';
    },

    // WebSocket服务器端口
    wsPort: 8080,

    // HTTP服务器端口
    httpPort: 3000,

    // 日志更新间隔（毫秒）
    updateInterval: 1000,

    // 最大显示行数
    maxLines: 1000
};
```

也可以通过环境变量设置日志文件路径：

```bash
LOG_FILE_PATH=/var/log/application.log npm start
```

## API 接口

### 获取配置

```
GET /api/config
```

返回当前配置信息，包括日志文件路径和最大行数。

### 重启日志监控

```
POST /api/restart
```

重新启动日志监控进程，用于切换日志文件或处理日志文件不存在的情况。

### 前端部署

修改public下的前端文件的接口地址，然后访问前端的index.html