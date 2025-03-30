const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs').promises;
const generateArticles = require('./generate-articles');

// 监听的目录
const BASE_DIR = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(BASE_DIR, 'articles');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');

// 监控 Markdown 文件的变化并生成对应的 HTML 文件
function watchMarkdownFiles() {
    console.log('开始监控 Markdown 文件变化...');
    
    // 监控各语言目录下的 Markdown 文件
    const watcher = chokidar.watch('articles/**/*.md', {
        ignored: [/(^|[\/\\])\../], // 只忽略隐藏文件，不忽略index.md（我们会在处理函数中跳过它）
        persistent: true
    });
    
    // 当文件被添加或修改时
    watcher.on('add', path => processFile(path))
        .on('change', path => processFile(path))
        .on('unlink', path => handleDelete(path))
        .on('ready', () => {
            console.log('初始化完成，开始监听文件变化...');
            console.log(`监听目录: ${ARTICLES_DIR}`);
        });
        
    // 处理文件变化
    function processFile(path) {
        console.log(`检测到文件变化: ${path}`);
        
        // 跳过 index.md 文件，避免覆盖已有的 index.html
        if (path.endsWith('index.md')) {
            console.log('跳过 index.md 文件');
            return;
        }
        
        // 提取文件所在的语言目录
        const pathParts = path.split('/');
        const lang = pathParts[1]; // articles/zh/xxx.md 中的 zh
        
        // 根据语言选择相应的处理函数
        if (['zh', 'en', 'jp'].includes(lang)) {
            console.log(`处理 ${lang} 语言的文章: ${path}`);
            
            // 调用 generate-articles.js 中的处理函数
            generateArticles.processMarkdownFile(path);
            
            // 更新相应语言的文章数据（不生成 index.html）
            generateArticles.generateLanguageData(lang);
            
            console.log(`处理完成: ${path}`);
        } else {
            console.log(`未知语言目录: ${lang}，跳过处理`);
        }
    }
    
    // 处理文件删除
    async function handleDelete(path) {
        console.log(`检测到文件删除: ${path}`);
        
        // 如果是删除事件，清理对应的 HTML 文件
        try {
            // 直接在同一目录中查找对应的HTML文件
            const htmlPath = path.replace('.md', '.html');
            
            // 删除对应的 HTML 文件
            await fs.unlink(htmlPath).catch(() => {});
            console.log(`已删除HTML文件: ${htmlPath}`);
            
            // 更新相应语言的文章数据（不生成 index.html）
            const pathParts = path.split('/');
            const lang = pathParts[1];
            
            if (['zh', 'en', 'jp'].includes(lang)) {
                generateArticles.generateLanguageData(lang);
            }
        } catch (err) {
            console.error('删除HTML文件时出错:', err);
        }
    }
    
    // 返回监听器以便外部可以关闭
    return watcher;
}

// 启动监控
const watcher = watchMarkdownFiles();

// 优雅退出
process.on('SIGINT', () => {
    if (watcher) {
        watcher.close().then(() => {
            console.log('停止文件监听');
            process.exit(0);
        });
    } else {
        console.log('停止文件监听');
        process.exit(0);
    }
});

// 导出函数，以便其他模块调用
module.exports = {
    watchMarkdownFiles
}; 