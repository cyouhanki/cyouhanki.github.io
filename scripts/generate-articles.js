const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const LANGUAGES = ['zh', 'en', 'jp'];
const BASE_DIR = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(BASE_DIR, 'articles');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');

async function generateArticles() {
    try {
        // 处理每种语言
        for (const lang of LANGUAGES) {
            const langDir = path.join(ARTICLES_DIR, lang);
            const publicLangDir = path.join(PUBLIC_DIR, 'articles', lang);
            const articles = [];

            // 确保目录存在
            await fs.mkdir(publicLangDir, { recursive: true });

            try {
                // 读取该语言下的所有 md 文件
                const files = await fs.readdir(langDir);
                const mdFiles = files.filter(file => file.endsWith('.md'));

                // 处理每个 md 文件
                for (const file of mdFiles) {
                    const filePath = path.join(langDir, file);
                    const content = await fs.readFile(filePath, 'utf-8');
                    const { data, content: markdown } = matter(content);
                    const html = marked(markdown);
                    const slug = path.basename(file, '.md');

                    // 生成文章对象
                    const article = {
                        title: data.title,
                        date: data.date,
                        category: data.category,
                        excerpt: data.excerpt,
                        slug: slug,
                        lang: lang
                    };

                    // 生成 HTML 文件
                    const htmlContent = generateHtml(article, html);
                    const htmlPath = path.join(publicLangDir, `${slug}.html`);
                    await fs.writeFile(htmlPath, htmlContent);

                    articles.push(article);
                }

                // 按日期排序
                articles.sort((a, b) => new Date(b.date) - new Date(a.date));

                // 更新 JSON 文件
                const jsonPath = path.join(PUBLIC_DIR, 'articles', `${lang}-articles.json`);
                await fs.writeFile(jsonPath, JSON.stringify(articles, null, 2));

            } catch (err) {
                if (err.code === 'ENOENT') {
                    // 如果语言目录不存在，创建空的文章列表
                    const jsonPath = path.join(PUBLIC_DIR, 'articles', `${lang}-articles.json`);
                    await fs.writeFile(jsonPath, JSON.stringify([], null, 2));
                } else {
                    throw err;
                }
            }
        }

        console.log('文章生成完成');
    } catch (err) {
        console.error('生成文章时出错:', err);
        process.exit(1);
    }
}

function generateHtml(article, content) {
    return `<!DOCTYPE html>
<html lang="${article.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Cyouhanki's Home</title>
    <link rel="stylesheet" href="/css/style.css">
    <link rel="stylesheet" href="/css/article.css">
</head>
<body>
    <header>
        <nav>
            <div class="nav-left">
                <a href="/" class="logo">Cyouhanki's Home</a>
            </div>
            <div class="nav-right">
                <div class="nav-links">
                    <a href="/">首页</a>
                    <a href="/articles/all">所有文章</a>
                    <a href="/articles/zh">中文</a>
                    <a href="/articles/en">En</a>
                    <a href="/articles/jp">日本語</a>
                </div>
            </div>
        </nav>
    </header>
    <main class="article-content">
        <article>
            <h1>${article.title}</h1>
            <div class="article-meta">
                <span class="article-date">${article.date}</span>
                <span class="article-category">${article.category}</span>
            </div>
            <div class="article-body">
                ${content}
            </div>
        </article>
    </main>
    <footer>
        <p>&copy; 2025 Cyouhanki's Home. All rights reserved.</p>
    </footer>
</body>
</html>`;
}

// 执行生成
generateArticles(); 