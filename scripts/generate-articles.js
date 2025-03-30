const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const LANGUAGES = ['zh', 'en', 'jp'];
const BASE_DIR = path.join(__dirname, '..');
const ARTICLES_DIR = path.join(BASE_DIR, 'articles');

async function generateArticles() {
    try {
        // 处理每种语言
        for (const lang of LANGUAGES) {
            const langDir = path.join(ARTICLES_DIR, lang);
            const articles = [];

            try {
                // 确保语言目录存在
                await fs.mkdir(langDir, { recursive: true });
                
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

                    // 跳过 index.md 文件，避免覆盖现有的 index.html
                    if (slug === 'index' && (lang === 'jp' || lang === 'en' || lang === 'zh')) {
                        console.log(`跳过生成 ${lang}/index.html 以避免覆盖`);
                        continue;
                    }

                    // 生成文章对象
                    const article = {
                        title: data.title,
                        date: data.date,
                        category: data.category,
                        excerpt: data.excerpt,
                        slug: slug,
                        lang: lang
                    };

                    // 生成 HTML 文件，直接保存在同一个语言目录中
                    const htmlContent = generateHtml(article, html);
                    const htmlPath = path.join(langDir, `${slug}.html`);
                    await fs.writeFile(htmlPath, htmlContent);

                    articles.push(article);
                }

                // 按日期排序
                articles.sort((a, b) => new Date(b.date) - new Date(a.date));

                // 将JSON文件也保存在articles目录下
                const jsonPath = path.join(ARTICLES_DIR, `${lang}-articles.json`);
                await fs.writeFile(jsonPath, JSON.stringify(articles, null, 2));
                
                // 跳过创建 zh/index.html 文件
                if (lang === 'zh') {
                    console.log(`跳过创建 zh/index.html 文件`);
                    continue;
                }
                
                // 检查索引页是否存在，如果不存在则创建
                const indexPath = path.join(langDir, 'index.html');
                try {
                    await fs.access(indexPath);
                    console.log(`保留已存在的 ${lang}/index.html`);
                } catch (error) {
                    // 文件不存在，创建默认索引页
                    console.log(`创建默认的 ${lang}/index.html`);
                    const indexHtml = generateLanguageIndexPage(lang, articles);
                    await fs.writeFile(indexPath, indexHtml);
                }

            } catch (err) {
                if (err.code === 'ENOENT') {
                    // 如果语言目录不存在，创建空的文章列表
                    const jsonPath = path.join(ARTICLES_DIR, `${lang}-articles.json`);
                    await fs.writeFile(jsonPath, JSON.stringify([], null, 2));
                } else {
                    throw err;
                }
            }
        }
        
        // 确保"all"目录存在，用于显示所有文章的页面
        const allDir = path.join(ARTICLES_DIR, 'all');
        await fs.mkdir(allDir, { recursive: true });
        
        // 如果"all"目录中没有index.html，则创建一个
        const allIndexPath = path.join(allDir, 'index.html');
        try {
            await fs.access(allIndexPath);
        } catch (error) {
            // 文件不存在，创建一个新的"所有文章"页面
            const allIndexHtml = generateAllArticlesPage();
            await fs.writeFile(allIndexPath, allIndexHtml);
        }

        console.log('文章生成完成');
    } catch (err) {
        console.error('生成文章时出错:', err);
        process.exit(1);
    }
}

function generateHtml(article, content) {
    // 根据语言动态计算相对路径
    const cssPath = `../../css`;
    const homePath = `../../`;
    const articlesPath = `../`;

    // 根据文章语言设置导航链接文本
    const homeText = article.lang === 'zh' ? '首页' : (article.lang === 'jp' ? 'ホーム' : 'Home');
    const allArticlesText = article.lang === 'zh' ? '所有文章' : (article.lang === 'jp' ? '記事一覧' : 'All Articles');

    return `<!DOCTYPE html>
<html lang="${article.lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${article.title} - Cyouhanki's Home</title>
    <link rel="stylesheet" href="${cssPath}/style.css">
    <link rel="stylesheet" href="${cssPath}/article.css">
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
                    <a href="${articlesPath}en">En</a>
                    <a href="${articlesPath}jp">日本語</a>
                </div>
                <button class="menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
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
    
    <script src="${cssPath}/../js/main.js"></script>
    <script>
        // 初始化移动端菜单
        document.addEventListener('DOMContentLoaded', function() {
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            
            if (menuToggle && navLinks) {
                menuToggle.addEventListener('click', function() {
                    menuToggle.classList.toggle('active');
                    navLinks.classList.toggle('active');
                });
            }
        });
    </script>
</body>
</html>`;
}

// 生成语言特定的文章索引页
function generateLanguageIndexPage(lang, articles) {
    // 根据语言确定标题
    const pageTitle = {
        'zh': '中文文章',
        'en': 'English Articles',
        'jp': '日本語記事'
    }[lang] || '文章列表';
    
    // 根据语言设置导航链接文本
    const homeText = lang === 'zh' ? '首页' : (lang === 'jp' ? 'ホーム' : 'Home');
    const allArticlesText = lang === 'zh' ? '所有文章' : (lang === 'jp' ? '記事一覧' : 'All Articles');
    
    // 生成文章列表HTML
    let articlesHtml = '';
    
    if (articles.length > 0) {
        articlesHtml = '<div class="articles-grid">';
        
        articles.forEach(article => {
            articlesHtml += `
        <article class="article-card">
          <a href="${article.slug}.html">
            <div class="article-card-inner">
              <h3 class="article-title">${article.title}</h3>
              <div class="article-meta">
                <span class="article-date">${article.date}</span>
                <span class="article-category">${article.category}</span>
              </div>
              <p class="article-excerpt">${article.excerpt}</p>
            </div>
          </a>
        </article>`;
        });
        
        articlesHtml += '</div>';
    } else {
        // 没有文章时显示的提示
        const noArticlesText = {
            'zh': '暂无文章',
            'en': 'No articles found',
            'jp': '記事が見つかりません'
        }[lang] || '暂无文章';
        
        articlesHtml = `<p class="no-articles">${noArticlesText}</p>`;
    }
    
    // 生成页面HTML
    return `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle} - Cyouhanki's Home</title>
    <link rel="stylesheet" href="../../css/style.css">
    <link rel="stylesheet" href="../../css/article.css">
</head>
<body>
    <header>
        <nav>
            <div class="nav-left">
                <a href="../../" class="logo">Cyouhanki's Home</a>
            </div>
            <div class="nav-right">
                <div class="nav-links">
                    <a href="../../">${homeText}</a>
                    <a href="../all">${allArticlesText}</a>
                    <a href="../en" ${lang === 'en' ? 'class="active"' : ''}>En</a>
                    <a href="../jp" ${lang === 'jp' ? 'class="active"' : ''}>日本語</a>
                </div>
                <button class="menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    </header>
    <main>
        <div class="articles-container">
            <h1 class="page-title">${pageTitle}</h1>
            <div class="articles-list">
                ${articlesHtml}
            </div>
        </div>
    </main>
    <footer>
        <p>&copy; 2025 Cyouhanki's Home. All rights reserved.</p>
    </footer>
    <script src="../../js/main.js"></script>
    <script>
        // 初始化移动端菜单
        document.addEventListener('DOMContentLoaded', function() {
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            
            if (menuToggle && navLinks) {
                menuToggle.addEventListener('click', function() {
                    menuToggle.classList.toggle('active');
                    navLinks.classList.toggle('active');
                });
            }
        });
    </script>
</body>
</html>`;
}

// 生成"所有文章"页面
function generateAllArticlesPage() {
    // 使用普通字符串拼接，而不是模板字符串
    return `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>所有文章 - Cyouhanki's Home</title>
    <link rel="stylesheet" href="../../css/style.css">
</head>
<body>
    <header>
        <nav>
            <div class="nav-left">
                <a href="../../" class="logo">Cyouhanki's Home</a>
            </div>
            <div class="nav-right">
                <div class="nav-links">
                    <a href="../../">首页</a>
                    <a href="../all" class="active">所有文章</a>
                    <a href="../en">En</a>
                    <a href="../jp">日本語</a>
                </div>
                <button class="menu-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </nav>
    </header>

    <main class="articles-page">
        <div class="articles-container">
            <h1>所有文章</h1>
            <div class="language-selector">
                <button class="lang-btn active" data-lang="all">全部</button>
                <button class="lang-btn" data-lang="zh">中文</button>
                <button class="lang-btn" data-lang="en">English</button>
                <button class="lang-btn" data-lang="jp">日本語</button>
            </div>
            <div class="articles-list"></div>
        </div>
    </main>

    <footer>
        <p>&copy; 2025 Cyouhanki's Home. All rights reserved.</p>
    </footer>

    <script>
        let allArticles = [];
        let currentLang = 'all'; // 默认显示所有语言的文章

        // 加载所有文章
        async function loadAllArticles() {
            const articlesContainer = document.querySelector('.articles-list');
            
            try {
                // 获取所有语言的文章
                const languages = ['zh', 'en', 'jp'];
                allArticles = [];
                
                // 获取所有语言的文章并合并
                let loadSuccess = false;
                for (const lang of languages) {
                    try {
                        const response = await fetch('../' + lang + '-articles.json');
                        if (response.ok) {
                            const articles = await response.json();
                            allArticles = allArticles.concat(articles.map(article => ({...article, lang})));
                            loadSuccess = true; // 至少成功加载了一种语言的文章
                        }
                    } catch (error) {
                        console.error('Error loading ' + lang + ' articles:', error);
                    }
                }
                
                if (!loadSuccess) {
                    throw new Error('无法加载任何文章');
                }
                
                // 按日期排序
                allArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                // 显示文章 - 确保显示所有语言的文章
                displayArticles();
            } catch (error) {
                console.error('Error loading articles:', error);
                articlesContainer.innerHTML = 
                    '<div style="text-align: center; padding: 2rem; color: #666;">' +
                    '加载文章失败，请稍后再试。' +
                    '</div>';
            }
        }

        // 显示文章
        function displayArticles() {
            const articlesContainer = document.querySelector('.articles-list');
            // 确保 currentLang 有效，如果不是有效值，则默认为 'all'
            if (!['all', 'zh', 'en', 'jp'].includes(currentLang)) {
                currentLang = 'all';
            }
            
            const filteredArticles = currentLang === 'all' 
                ? allArticles 
                : allArticles.filter(article => article.lang === currentLang);

            if (filteredArticles.length === 0) {
                articlesContainer.innerHTML = '<p class="no-articles">暂无文章</p>';
                return;
            }

            const articlesList = document.createElement('div');
            articlesList.className = 'articles-grid';

            filteredArticles.forEach(article => {
                const articleCard = document.createElement('article');
                articleCard.className = 'article-card';
                
                // 获取语言显示文本
                const langText = {
                    'zh': '中文',
                    'en': 'English',
                    'jp': '日本語'
                }[article.lang];
                
                articleCard.innerHTML = 
                    '<a href="../' + article.lang + '/' + article.slug + '.html">' +
                        '<div class="article-card-inner">' +
                            '<h3 class="article-title">' + article.title + '</h3>' +
                            '<div class="article-meta">' +
                                '<span class="article-date">' + article.date + '</span>' +
                                '<span class="article-category">' + article.category + '</span>' +
                                '<span class="article-lang">' + langText + '</span>' +
                            '</div>' +
                            '<p class="article-excerpt">' + article.excerpt + '</p>' +
                        '</div>' +
                    '</a>';
                
                articlesList.appendChild(articleCard);
            });

            articlesContainer.innerHTML = '';
            articlesContainer.appendChild(articlesList);

            // 添加动画效果
            const articleCards = document.querySelectorAll('.article-card');
            articleCards.forEach((card, index) => {
                card.style.animationDelay = index * 0.1 + 's';
                card.classList.add('fade-in');
            });
        }

        // 页面加载完成后执行
        document.addEventListener('DOMContentLoaded', () => {
            // 初始化移动端菜单
            const menuToggle = document.querySelector('.menu-toggle');
            const navLinks = document.querySelector('.nav-links');
            
            if (menuToggle && navLinks) {
                menuToggle.addEventListener('click', () => {
                    menuToggle.classList.toggle('active');
                    navLinks.classList.toggle('active');
                });
            }

            // 初始化语言切换
            const langButtons = document.querySelectorAll('.lang-btn');
            langButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    langButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentLang = btn.dataset.lang;
                    displayArticles();
                });
            });
            
            // 加载所有文章并显示
            loadAllArticles();
        });
    </script>
</body>
</html>`;
}

// 执行生成
generateArticles(); 