const express = require('express');
const path = require('path');
const app = express();

// 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

// 处理所有路由
app.get('*', (req, res) => {
    // 如果请求的是目录，则返回对应的 index.html
    if (req.path.endsWith('/')) {
        res.sendFile(path.join(__dirname, 'public', req.path, 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', req.path));
    }
});

// 启动服务器
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
}); 