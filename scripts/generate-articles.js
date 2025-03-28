const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked');
const matter = require('gray-matter');

// 文章源文件和目标文件夹配置
const config = {
    sourceDirs: {
        zh: path.join(__dirname, '../articles/zh'),
        en: path.join(__dirname, '../articles/en'),
        jp: path.join(__dirname, '../articles/jp')
    },
    outputDirs: {
        zh: path.join(__dirname, '../public/articles/zh'),
        en: path.join(__dirname, '../public/articles/en'),
        jp: path.join(__dirname, '../public/articles/jp')
    },
    jsonOutputDir: path.join(__dirname, '../public/articles')
};

// 文章模板
const articleTemplate = (content, meta) => {
    const basePath = process.env.BASE_PATH || '';
    return `
<!DOCTYPE html>
<html lang="${meta.language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${meta.title}</title>
    <link rel="stylesheet" href="${basePath}/css/style.css">
    <link rel="stylesheet" href="${basePath}/css/article.css">
</head>
<body>
    <header>
        <nav>
            <div class="nav-left">
                <a href="${basePath}/" class="logo">My Blog</a>
            </div>
            <div class="nav-right">
                <div class="nav-links">
                    <a href="${basePath}/">首页</a>
                    <a href="${basePath}/articles">文章</a>
                </div>
                <div class="language-switcher">
                    <a href="${basePath}/" data-lang="zh">中文</a>
                    <a href="${basePath}/en" data-lang="en">EN</a>
                    <a href="${basePath}/jp" data-lang="jp">日本語</a>
                </div>
            </div>
            <button class="menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    </header>
    <main>
        <article class="article-content">
            <h1>${meta.title}</h1>
            <div class="article-meta">
                <time>${meta.date}</time>
                <span class="category">${meta.category}</span>
            </div>
            ${content}
        </article>
    </main>
    <script src="${basePath}/js/main.js"></script>
</body>
</html>`;
};

// 处理单个markdown文件
async function processMarkdown(filePath, language) {
    const content = await fs.readFile(filePath, 'utf-8');
    const { data: meta, content: markdown } = matter(content);
    const html = marked(markdown);
    
    // 准备文章元数据
    const articleMeta = {
        ...meta,
        language,
        date: meta.date ? new Date(meta.date).toISOString().split('T')[0] : '',
        slug: path.basename(filePath, '.md')
    };

    return {
        html: articleTemplate(html, articleMeta),
        meta: articleMeta
    };
}

// 确保目录存在
async function ensureDir(dir) {
    try {
        await fs.mkdir(dir, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
    }
}

// 主函数
async function generateArticles() {
    const articles = {
        zh: [],
        en: [],
        jp: []
    };

    // 处理每种语言的文章
    for (const [lang, sourceDir] of Object.entries(config.sourceDirs)) {
        try {
            // 确保输出目录存在
            await ensureDir(config.outputDirs[lang]);
            
            // 读取该语言的所有markdown文件
            const files = await fs.readdir(sourceDir);
            const mdFiles = files.filter(file => file.endsWith('.md'));

            // 处理每个文件
            for (const file of mdFiles) {
                const filePath = path.join(sourceDir, file);
                const { html, meta } = await processMarkdown(filePath, lang);
                
                // 保存HTML文件
                const outputPath = path.join(config.outputDirs[lang], `${path.basename(file, '.md')}.html`);
                await fs.writeFile(outputPath, html);
                
                // 收集文章元数据
                articles[lang].push(meta);
            }
        } catch (error) {
            console.error(`Error processing ${lang} articles:`, error);
        }
    }

    // 确保JSON输出目录存在
    await ensureDir(config.jsonOutputDir);

    // 保存每种语言的文章索引
    for (const [lang, articleList] of Object.entries(articles)) {
        const jsonPath = path.join(config.jsonOutputDir, `${lang}-articles.json`);
        await fs.writeFile(jsonPath, JSON.stringify(articleList, null, 2));
    }

    console.log('Articles generated successfully!');
}

// 执行生成
generateArticles().catch(console.error); 