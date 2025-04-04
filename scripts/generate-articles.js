const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const LANGUAGES = ['zh', 'en', 'jp'];
const BASE_DIR = path.resolve(__dirname, '..');
const ARTICLES_DIR = path.join(BASE_DIR, 'articles');

// 解析文章元数据
function parseArticleMetadata(content, filePath) {
    // 使用 gray-matter 解析 frontmatter
    const { data, content: markdownContent } = matter(content);
    
    // 提取文件名（不含扩展名）作为 slug
    const fileName = path.basename(filePath, path.extname(filePath));
    
    // 提取语言信息
    const dirName = path.basename(path.dirname(filePath));
    
    // 构建文章对象
    const article = {
        title: data.title || '无标题',
        date: data.date ? new Date(data.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        category: data.category || '未分类',
        excerpt: data.excerpt || '无摘要',
        slug: fileName,
        lang: dirName,
        content: markdownContent
    };
    
    return article;
}

// 处理单个 Markdown 文件生成对应的 HTML
function processMarkdownFile(filePath) {
    try {
        // 跳过 index.md 文件，避免覆盖已有的 index.html
        if (path.basename(filePath) === 'index.md') {
            console.log(`跳过处理 index.md 文件: ${filePath}`);
            return null;
        }
        
        // 读取 Markdown 文件内容
        const mdContent = fs.readFileSync(filePath, 'utf8');
        
        // 解析文章元数据和内容
        const article = parseArticleMetadata(mdContent, filePath);
        
        // 将 Markdown 内容转换为 HTML
        const htmlContent = marked(article.content);
        
        // 生成完整的 HTML 文件
        const fullHtml = generateHtml(article, htmlContent);
        
        // 确定输出路径
        const outputPath = filePath.replace('.md', '.html');
        
        // 写入 HTML 文件
        fs.writeFileSync(outputPath, fullHtml);
        
        console.log(`生成 HTML 文件: ${outputPath}`);
        
        return article; // 返回文章对象，以便进一步处理
    } catch (error) {
        console.error(`处理文件 ${filePath} 时出错:`, error);
        return null;
    }
}

// 生成特定语言的文章 JSON 数据（不生成 index.html）
function generateLanguageData(lang) {
    try {
        // 获取该语言下的所有 Markdown 文件
        const langDir = path.join(ARTICLES_DIR, lang);
        let files;
        
        try {
            files = fs.readdirSync(langDir);
        } catch (error) {
            console.error(`读取目录 ${langDir} 失败:`, error);
            return [];
        }
        
        // 过滤出 .md 文件，但排除 index.md
        const mdFiles = files.filter(file => 
            file.endsWith('.md') && file !== 'index.md'
        );
        
        // 解析每个文件，提取元数据
        const articles = [];
        
        for (const file of mdFiles) {
            const filePath = path.join(langDir, file);
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const article = parseArticleMetadata(content, filePath);
                articles.push(article);
            } catch (error) {
                console.error(`解析文件 ${filePath} 时出错:`, error);
            }
        }
        
        // 按日期降序排序（最新的文章在前）
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // 保存 JSON 数据
        const jsonPath = path.join(ARTICLES_DIR, `${lang}-articles.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(articles, null, 2));
        console.log(`生成 ${lang} 语言文章数据: ${jsonPath}`);
        
        return articles;
    } catch (error) {
        console.error(`生成 ${lang} 语言文章数据时出错:`, error);
        return [];
    }
}

// 主函数
function main() {
    // 确保文章目录存在
    if (!fs.existsSync(ARTICLES_DIR)) {
        console.error(`文章目录不存在: ${ARTICLES_DIR}`);
        return;
    }
    
    // 处理每种语言的文章
    for (const lang of LANGUAGES) {
        const langDir = path.join(ARTICLES_DIR, lang);
        
        // 确保语言目录存在
        if (!fs.existsSync(langDir)) {
            console.log(`创建语言目录: ${langDir}`);
            fs.mkdirSync(langDir, { recursive: true });
        }
        
        // 读取该语言下的所有 Markdown 文件
        try {
            const files = fs.readdirSync(langDir);
            const mdFiles = files.filter(file => file.endsWith('.md') && file !== 'index.md');
            
            console.log(`${lang} 语言文章数量: ${mdFiles.length}`);
            
            // 解析每个文件并生成 HTML
            const articles = [];
            
            for (const file of mdFiles) {
                const filePath = path.join(langDir, file);
                const article = processMarkdownFile(filePath);
                if (article) {
                    articles.push(article);
                }
            }
            
            // 生成语言文章数据（不生成 index.html）
            generateLanguageData(lang);
            
        } catch (error) {
            console.error(`处理 ${lang} 语言文章时出错:`, error);
        }
    }
    
    console.log('所有文章处理完成');
}

// 如果作为独立脚本运行
if (require.main === module) {
    main();
}

// 导出函数供其他模块使用
module.exports = {
    processMarkdownFile,
    generateLanguageData,
    generateHtml,
    parseArticleMetadata
};

function generateHtml(article, content) {
    // 根据语言动态计算相对路径
    const cssPath = `../../css`;
    const homePath = `../../`;
    const articlesPath = `../`;

    // 根据文章语言设置导航链接文本
    const homeText = article.lang === 'zh' ? '首页' : (article.lang === 'jp' ? 'ホーム' : 'Home');
    const allArticlesText = article.lang === 'zh' ? '所有文章' : (article.lang === 'jp' ? '記事一覧' : 'All Articles');
    
    // 为目录提取标题
    const headings = content.match(/<h[1-2] id="(.+?)">(.+?)<\/h[1-2]>/g) || [];
    const tocItems = headings.map(heading => {
        const match = heading.match(/<h[1-2] id="(.+?)">(.+?)<\/h[1-2]>/);
        if (match && match.length >= 3) {
            return {
                id: match[1],
                text: match[2]
            };
        }
        return null;
    }).filter(item => item !== null);
    
    // 生成目录 HTML
    const tocHtml = tocItems.map(item => 
        `<li><a href="#${item.id}">${item.text}</a></li>`
    ).join('\n            ');
    
    // 目录标题文本根据语言设置
    const tocTitle = article.lang === 'zh' ? '目录' : (article.lang === 'jp' ? '目次' : 'Table of Contents');

    return `<!DOCTYPE html>
<html lang="${article.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
    <meta http-equiv="Pragma" content="no-cache">
    <meta http-equiv="Expires" content="0">
    <title>${article.title} - Cyouhanki's Home</title>
    <link rel="stylesheet" href="${cssPath}/style.css">
    <link rel="stylesheet" href="${cssPath}/article.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* 现代文章页面样式 */
        :root {
            --main-bg: #ffffff;
            --content-bg: #ffffff;
            --text-primary: #111827;
            --text-secondary: #4b5563;
            --text-tertiary: #6b7280;
            --accent-color: #333333;
            --accent-light: #e2e2e2;
            --border-color: #e5e7eb;
            --code-bg: #f9fafb;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }

        body {
            font-family: 'Inter', 'Noto Sans JP', sans-serif;
            background-color: var(--main-bg);
            color: var(--text-primary);
            line-height: 1.7;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        main.article-content {
            max-width: 768px;
            margin: 6rem auto 5rem;
            padding: 0 1.5rem;
        }

        article {
            background-color: var(--content-bg);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: var(--shadow-md);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        article:hover {
            transform: translateY(-3px);
            box-shadow: var(--shadow-lg);
        }

        article > h1 {
            font-size: 2.5rem;
            font-weight: 700;
            line-height: 1.2;
            margin: 2rem 2rem 1rem;
            color: var(--text-primary);
            letter-spacing: -0.02em;
        }

        .article-meta {
            display: flex;
            gap: 1rem;
            margin: 0 2rem 2rem;
            font-size: 0.875rem;
            color: var(--text-tertiary);
        }

        .article-date, .article-category {
            display: flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            background-color: rgba(243, 244, 246, 0.8);
            border-radius: 100px;
        }

        .article-date::before {
            content: '\\f133';
            font-family: 'Font Awesome 6 Free';
            font-weight: 400;
            margin-right: 0.5rem;
        }

        .article-category::before {
            content: '\\f07b';
            font-family: 'Font Awesome 6 Free';
            font-weight: 400;
            margin-right: 0.5rem;
        }

        .article-body {
            padding: 0 2rem 3rem;
            font-size: 1.125rem;
            color: var(--text-primary);
        }

        .article-body h1 {
            font-size: 2.25rem;
            font-weight: 700;
            margin: 2.5rem 0 1.5rem;
            letter-spacing: -0.02em;
            line-height: 1.3;
            color: var(--text-primary);
        }

        .article-body h2 {
            font-size: 1.75rem;
            font-weight: 600;
            margin: 2.25rem 0 1.25rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border-color);
            letter-spacing: -0.015em;
            line-height: 1.3;
            color: var(--text-primary);
        }

        .article-body p {
            margin-bottom: 1.5rem;
            color: var(--text-secondary);
        }

        .article-body strong {
            font-weight: 600;
            color: var(--text-primary);
        }

        .article-body ol {
            margin: 1.5rem 0 2rem 1.5rem;
            padding-left: 1rem;
            color: var(--text-secondary);
        }

        .article-body li {
            margin-bottom: 0.75rem;
            position: relative;
        }

        .article-body li::marker {
            color: var(--accent-color);
        }

        .article-body hr {
            margin: 3rem 0;
            border: none;
            height: 1px;
            background-color: var(--border-color);
        }

        /* 添加内容导航栏 */
        .article-toc {
            position: fixed;
            right: 2rem;
            top: 10rem;
            width: 16rem;
            max-height: 70vh;
            overflow-y: auto;
            background-color: var(--content-bg);
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: var(--shadow-sm);
            display: none;
        }

        @media (min-width: 1280px) {
            .article-toc {
                display: block;
            }
        }

        .toc-title {
            font-size: 1rem;
            font-weight: 600;
            margin-bottom: 1rem;
            color: var(--text-primary);
        }

        .toc-list {
            list-style: none;
            padding: 0;
        }

        .toc-list li {
            margin-bottom: 0.5rem;
        }

        .toc-list a {
            display: block;
            padding: 0.25rem 0;
            font-size: 0.875rem;
            color: var(--text-tertiary);
            text-decoration: none;
            transition: color 0.2s ease, background-color 0.2s ease;
            border-radius: 4px;
            padding: 0.35rem 0.5rem;
        }

        .toc-list a:hover {
            color: var(--accent-color);
            background-color: var(--accent-light);
        }
        
        .toc-list a.active {
            color: var(--accent-color);
            background-color: var(--accent-light);
            font-weight: 500;
        }

        /* 阅读进度条 */
        .progress-container {
            position: fixed;
            top: 0;
            z-index: 1000;
            width: 100%;
            height: 3px;
            background: transparent;
        }

        .progress-bar {
            height: 3px;
            background: var(--accent-color);
            width: 0;
        }

        /* 返回顶部按钮 */
        .back-to-top {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            width: 3rem;
            height: 3rem;
            background-color: var(--accent-color);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transform: translateY(10px);
            transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s ease;
            box-shadow: var(--shadow-md);
            border: none;
            z-index: 990;
        }

        .back-to-top:hover {
            background-color: #000000;
        }

        .back-to-top.visible {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }

        /* 移动端菜单按钮 */
        .menu-toggle {
            display: none;
            flex-direction: column;
            justify-content: space-between;
            width: 24px;
            height: 18px;
            background-color: transparent;
            border: none;
            cursor: pointer;
            z-index: 1002;
            padding: 0;
            margin-left: 20px;
            position: relative;
        }
        
        .menu-toggle span {
            display: block;
            width: 100%;
            height: 2px;
            background-color: #333;
            border-radius: 2px;
            transition: all 0.3s ease;
            pointer-events: none;
        }
        
        /* 移动端菜单按钮激活状态 */
        .menu-toggle.active span:nth-child(1) {
            transform: translateY(8px) rotate(45deg);
        }
        
        .menu-toggle.active span:nth-child(2) {
            opacity: 0;
            transform: translateX(-10px);
        }
        
        .menu-toggle.active span:nth-child(3) {
            transform: translateY(-8px) rotate(-45deg);
        }

        /* 响应式调整 */
        @media (max-width: 768px) {
            .menu-toggle {
                display: flex;
            }
            
            .nav-right {
                position: relative;
                display: flex;
                align-items: center;
            }
            
            .nav-links {
                display: none;
                position: fixed;
                top: 60px;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.98);
                padding: 20px;
                flex-direction: column;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                backdrop-filter: blur(10px);
                -webkit-backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }
            
            .nav-links.active {
                display: flex;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .nav-links a {
                font-size: 16px;
                padding: 15px 0;
                width: 100%;
                text-align: center;
                color: #333;
                transition: all 0.2s ease;
            }
            
            .nav-links a:hover, .nav-links a.active {
                background-color: rgba(0, 0, 0, 0.05);
                font-weight: 500;
            }
            
            main.article-content {
                margin-top: 5rem;
                padding: 0 1rem;
            }

            article > h1 {
                font-size: 1.75rem;
                margin: 1.5rem 1.5rem 0.75rem;
            }

            .article-meta {
                margin: 0 1.5rem 1.5rem;
                flex-wrap: wrap;
            }

            .article-body {
                padding: 0 1.5rem 2rem;
                font-size: 1rem;
            }

            .article-body h1 {
                font-size: 1.75rem;
            }

            .article-body h2 {
                font-size: 1.5rem;
            }
        }

        /* 代码块样式 */
        .article-body code {
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
            background-color: var(--code-bg);
            padding: 0.2em 0.4em;
            border-radius: 4px;
            font-size: 0.875em;
            color: var(--text-primary);
        }

        /* 引用样式 */
        .article-body blockquote {
            border-left: 4px solid var(--accent-light);
            padding-left: 1rem;
            margin-left: 0;
            margin-bottom: 1.5rem;
            font-style: italic;
            color: var(--text-tertiary);
        }

        /* 卡片式设计 */
        .article-cards {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .card {
            background-color: var(--main-bg);
            border-radius: 8px;
            overflow: hidden;
            box-shadow: var(--shadow-sm);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            border: 1px solid var(--border-color);
        }

        .card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .card-content {
            padding: 1.5rem;
        }

        .card h3 {
            font-size: 1.25rem;
            margin-top: 0;
            margin-bottom: 0.75rem;
            color: var(--text-primary);
        }

        .card p {
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: 0;
        }
    </style>
</head>
<body>
    <header>
        <nav>
            <div class="nav-left">
                <a href="${homePath}" class="logo">Cyouhanki's Home</a>
            </div>
            <div class="nav-right">
                <div class="nav-links">
                    <a href="${homePath}">${homeText}</a>
                    <a href="${articlesPath}all">${allArticlesText}</a>
                    <a href="${articlesPath}en"${article.lang === 'en' ? ' class="active"' : ''}>English</a>
                    <a href="${articlesPath}jp"${article.lang === 'jp' ? ' class="active"' : ''}>日本語</a>
                </div>
                <button id="menuToggleBtn" class="menu-toggle" aria-label="メニュー" aria-expanded="false" aria-controls="nav-links">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    </header>

    <div class="progress-container">
        <div class="progress-bar" id="progressBar"></div>
    </div>

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

    ${tocItems.length > 0 ? `
    <aside class="article-toc">
        <div class="toc-title">${tocTitle}</div>
        <ul class="toc-list">
            ${tocHtml}
        </ul>
    </aside>
    ` : ''}

    <button class="back-to-top" id="backToTop">
        <i class="fas fa-arrow-up"></i>
    </button>

    <footer>
        <p>&copy; 2025 Cyouhanki's Home. All rights reserved.</p>
    </footer>
    
    <script>
        console.log('[文章页面] 初始化中...');
        
        // 定义一个为菜单按钮添加事件的函数
        function initMenuToggle() {
            const menuToggle = document.getElementById('menuToggleBtn');
            const navLinks = document.querySelector('.nav-links');
            const body = document.body;
            
            console.log('[文章页面] 菜单元素:', {
                menuToggle: menuToggle ? '找到' : '未找到',
                navLinks: navLinks ? '找到' : '未找到'
            });
            
            if (!menuToggle || !navLinks) {
                console.error('[文章页面] 找不到菜单元素!');
                return;
            }
            
            console.log('[文章页面] 设置菜单按钮样式');
            
            // 确保移动端设备上显示菜单按钮
            if (window.innerWidth <= 768) {
                menuToggle.style.display = 'flex';
            }
            
            // 为菜单按钮添加点击处理程序
            console.log('[文章页面] 开始绑定菜单按钮事件');
            
            // 创建汉堡按钮点击处理函数
            function handleMenuToggle(e) {
                console.log('[文章页面] 菜单按钮被点击');
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                
                menuToggle.classList.toggle('active');
                navLinks.classList.toggle('active');
                
                // 当菜单打开时，设置无障碍属性
                const expanded = menuToggle.classList.contains('active');
                menuToggle.setAttribute('aria-expanded', expanded);
                
                // 防止滚动
                body.style.overflow = expanded ? 'hidden' : '';
                
                console.log('[文章页面] 菜单状态:', expanded ? '开启' : '关闭');
                return false; // 防止事件冒泡
            }
            
            // 确保多种方式绑定事件
            menuToggle.onclick = handleMenuToggle;
            menuToggle.addEventListener('click', handleMenuToggle);
            menuToggle.addEventListener('touchend', function(e) {
                e.preventDefault();
                handleMenuToggle(e);
            });
            
            // 点击导航链接时关闭菜单
            const links = navLinks.querySelectorAll('a');
            links.forEach(link => {
                link.addEventListener('click', function() {
                    console.log('[文章页面] 导航链接被点击，关闭菜单');
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    body.style.overflow = '';
                });
            });
            
            // 点击页面其他区域时关闭菜单
            document.addEventListener('click', function(e) {
                if (navLinks.classList.contains('active') && 
                    !menuToggle.contains(e.target) && 
                    !navLinks.contains(e.target)) {
                    console.log('[文章页面] 外部区域被点击，关闭菜单');
                    menuToggle.classList.remove('active');
                    navLinks.classList.remove('active');
                    menuToggle.setAttribute('aria-expanded', 'false');
                    body.style.overflow = '';
                }
            });
            
            console.log('[文章页面] 菜单按钮初始化完成');
        }
        
        // 立即初始化菜单
        initMenuToggle();
        
        // DOM完全加载后再次尝试初始化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[文章页面] DOM完全加载完成');
            initMenuToggle(); // 再次尝试初始化
            
            // 添加窗口调整大小事件处理
            window.addEventListener('resize', function() {
                const menuToggle = document.getElementById('menuToggleBtn');
                if (menuToggle) {
                    if (window.innerWidth <= 768) {
                        menuToggle.style.display = 'flex';
                    } else {
                        menuToggle.style.display = 'none';
                    }
                }
            });
            
            // 阅读进度条
            const progressBar = document.getElementById('progressBar');
            window.addEventListener('scroll', function() {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                if (progressBar) {
                    progressBar.style.width = scrolled + '%';
                }
            });

            // 返回顶部按钮
            const backToTopButton = document.getElementById('backToTop');
            
            window.addEventListener('scroll', function() {
                if (window.scrollY > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
                
                // 更新目录激活状态
                updateTocActiveState();
            });
            
            backToTopButton.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });

            // 平滑滚动
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    
                    const targetId = this.getAttribute('href');
                    const targetElement = document.querySelector(targetId);
                    
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });
            
            // 更新目录激活状态的函数
            function updateTocActiveState() {
                // 获取所有标题元素
                const headings = document.querySelectorAll('.article-body h1, .article-body h2');
                if (!headings.length) return;
                
                // 获取所有目录链接
                const tocLinks = document.querySelectorAll('.toc-list a');
                if (!tocLinks.length) return;
                
                // 移除所有激活状态
                tocLinks.forEach(link => {
                    link.classList.remove('active');
                });
                
                // 找出当前可见的标题
                let currentHeadingId = null;
                const scrollPosition = window.scrollY + 100; // 添加偏移量以提前激活
                
                for (let i = 0; i < headings.length; i++) {
                    const heading = headings[i];
                    const nextHeading = headings[i + 1];
                    
                    if (
                        heading.offsetTop <= scrollPosition && 
                        (!nextHeading || nextHeading.offsetTop > scrollPosition)
                    ) {
                        currentHeadingId = heading.id;
                        break;
                    }
                }
                
                // 如果滚动到文章底部，激活最后一个标题
                if (!currentHeadingId && headings.length > 0 && 
                    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
                    currentHeadingId = headings[headings.length - 1].id;
                }
                
                // 激活对应的目录项
                if (currentHeadingId) {
                    const activeLink = document.querySelector('.toc-list a[href="#' + currentHeadingId + '"]');
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            }
            
            // 初始化时更新一次目录状态
            updateTocActiveState();
        });
    </script>
</body>
</html>`;
} 