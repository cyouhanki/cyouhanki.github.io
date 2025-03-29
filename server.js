const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

// 设置静态文件目录
app.use(express.static(path.join(__dirname)));

// 特殊处理 articles/xx/xx-articles.json 路径
app.get('/articles/:lang/:lang-articles.json', (req, res) => {
    const lang = req.params.lang;
    const jsonPath = path.join(__dirname, 'articles', `${lang}-articles.json`);
    
    // 检查文件是否存在
    if (fs.existsSync(jsonPath)) {
        res.sendFile(jsonPath);
    } else {
        res.status(404).json([]);  // 返回空数组而非错误
    }
});

// 特殊处理 articles/xx-articles.json 路径
app.get('/articles/:lang-articles.json', (req, res) => {
    const lang = req.params.lang;
    const jsonPath = path.join(__dirname, 'articles', `${lang}-articles.json`);
    
    // 检查文件是否存在
    if (fs.existsSync(jsonPath)) {
        res.sendFile(jsonPath);
    } else {
        res.status(404).json([]);  // 返回空数组而非错误
    }
});

// 特殊处理images文件夹
app.get('/images/*', (req, res) => {
    const imagePath = path.join(__dirname, req.path);
    
    // 检查文件是否存在
    if (fs.existsSync(imagePath)) {
        res.sendFile(imagePath);
    } else {
        // 尝试从unuse目录获取
        const unuseImagePath = path.join(__dirname, 'unuse', req.path);
        if (fs.existsSync(unuseImagePath)) {
            res.sendFile(unuseImagePath);
        } else {
            // 返回默认图片
            res.sendFile(path.join(__dirname, 'images', 'placeholder.jpg'));
        }
    }
});

// 明确处理根路径，返回根目录的index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 处理所有其他路由
app.get('*', (req, res, next) => {
    // 检查路径中是否包含 .json
    if (req.path.includes('.json')) {
        // 如果是JSON文件，可能是文章列表
        const parts = req.path.split('/');
        const filename = parts[parts.length - 1];
        
        if (filename.includes('-articles.json')) {
            const lang = filename.split('-')[0];
            const jsonPath = path.join(__dirname, 'articles', `${lang}-articles.json`);
            
            if (fs.existsSync(jsonPath)) {
                return res.sendFile(jsonPath);
            } else {
                return res.status(404).json([]);
            }
        }
    }
    
    // 如果请求的是目录，则返回对应的 index.html
    if (req.path.endsWith('/')) {
        const indexPath = path.join(__dirname, req.path, 'index.html');
        
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        } else {
            return res.sendFile(path.join(__dirname, 'index.html'));
        }
    } 
    
    // 处理普通文件请求
    const filePath = path.join(__dirname, req.path);
    
    if (fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    } else {
        // 尝试从unuse目录查找
        const unusePath = path.join(__dirname, 'unuse', req.path);
        if (fs.existsSync(unusePath)) {
            return res.sendFile(unusePath);
        }
        
        next(); // 交给下一个处理器
    }
});

// 404处理
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).send('服务器出错，请稍后再试');
});

// 启动服务器
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
    console.log(`Press Ctrl+C to stop the server`);
}); 