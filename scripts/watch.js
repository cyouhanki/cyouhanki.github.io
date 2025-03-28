const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs').promises;

// 监听的目录
const BASE_DIR = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(BASE_DIR, 'articles');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');

// 创建监听器
const watcher = chokidar.watch(`${ARTICLES_DIR}/**/*.md`, {
    ignored: /(^|[\/\\])\../, // 忽略隐藏文件
    persistent: true
});

// 处理文件变化
async function handleFileChange(filePath, eventType) {
    console.log(`检测到文件${eventType === 'unlink' ? '删除' : '变化'}: ${filePath}`);
    
    // 如果是删除事件，清理对应的 HTML 文件
    if (eventType === 'unlink') {
        try {
            const relativePath = path.relative(ARTICLES_DIR, filePath);
            const [lang, filename] = relativePath.split(path.sep);
            const slug = path.basename(filename, '.md');
            const htmlPath = path.join(PUBLIC_DIR, 'articles', lang, `${slug}.html`);
            
            // 删除对应的 HTML 文件
            await fs.unlink(htmlPath).catch(() => {});
            console.log(`已删除HTML文件: ${htmlPath}`);
        } catch (err) {
            console.error('删除HTML文件时出错:', err);
        }
    }
    
    // 重新生成所有文件
    exec('node scripts/generate-articles.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`执行出错: ${error}`);
            return;
        }
        if (stderr) {
            console.error(`脚本错误: ${stderr}`);
            return;
        }
        console.log(`更新成功: ${stdout}`);
    });
}

// 监听事件
watcher
    .on('add', filePath => handleFileChange(filePath, 'add'))     // 新增文件
    .on('change', filePath => handleFileChange(filePath, 'change')) // 修改文件
    .on('unlink', filePath => handleFileChange(filePath, 'unlink')) // 删除文件
    .on('ready', () => {
        console.log('初始化完成，开始监听文件变化...');
        console.log(`监听目录: ${ARTICLES_DIR}`);
    });

// 优雅退出
process.on('SIGINT', () => {
    watcher.close().then(() => {
        console.log('停止文件监听');
        process.exit(0);
    });
}); 