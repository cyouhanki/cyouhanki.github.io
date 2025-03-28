const fs = require('fs');
const path = require('path');
const marked = require('marked');
const matter = require('gray-matter');

// 支持的语言
const languages = ['zh', 'en', 'jp'];

// 项目根目录路径
const rootDir = path.join(__dirname, '../..');

// HTML模板
function createHtmlTemplate(title, content, language) {
  return `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Cyouhanki's Home</title>
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
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
                    <a href="/articles/zh" ${language === 'zh' ? 'class="active"' : ''}>中文</a>
                    <a href="/articles/en" ${language === 'en' ? 'class="active"' : ''}>En</a>
                    <a href="/articles/jp" ${language === 'jp' ? 'class="active"' : ''}>日本語</a>
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
        <article class="article-content">
            ${content}
        </article>
        <div class="back-to-home">
            <a href="/">返回首页</a>
        </div>
    </main>
    <footer>
        <p>&copy; 2025 Cyouhanki's Home. All rights reserved.</p>
    </footer>
    <script src="/js/main.js"></script>
</body>
</html>`;
}

// 创建文章列表页面
function createArticleListPage(language, articles) {
  const pageTitle = {
    zh: '文章列表',
    en: 'Article List',
    jp: '記事一覧'
  }[language] || '文章列表';

  const listHeaderText = {
    zh: '所有文章',
    en: 'All Articles',
    jp: '全ての記事'
  }[language] || '所有文章';

  const noArticlesText = {
    zh: '暂无文章',
    en: 'No articles found',
    jp: '記事が見つかりません'
  }[language] || '暂无文章';

  let articlesHtml = '';
  
  if (articles.length === 0) {
    articlesHtml = `<p class="no-articles">${noArticlesText}</p>`;
  } else {
    articlesHtml = '<div class="articles-grid">';
    
    articles.forEach(article => {
      articlesHtml += `
        <article class="article-card">
          <a href="/articles/${language}/${article.slug}.html">
            <h3>${article.title}</h3>
            <div class="article-meta">
              <span class="article-date">${article.date}</span>
              <span class="article-category">${article.category || '未分类'}</span>
            </div>
            <p class="article-excerpt">${article.excerpt || '暂无摘要'}</p>
          </a>
        </article>
      `;
    });
    
    articlesHtml += '</div>';
  }

  return `<!DOCTYPE html>
<html lang="${language}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageTitle} - Cyouhanki's Home</title>
    <link rel="icon" type="image/x-icon" href="/images/favicon.ico">
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
                    <a href="/articles/zh" ${language === 'zh' ? 'class="active"' : ''}>中文</a>
                    <a href="/articles/en" ${language === 'en' ? 'class="active"' : ''}>En</a>
                    <a href="/articles/jp" ${language === 'jp' ? 'class="active"' : ''}>日本語</a>
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
            <h1 class="page-title">${listHeaderText}</h1>
            <div class="articles-list">
                ${articlesHtml}
            </div>
        </div>
    </main>
    <footer>
        <p>&copy; 2025 Cyouhanki's Home. All rights reserved.</p>
    </footer>
    <script src="/js/main.js"></script>
</body>
</html>`;
}

// 创建文章页面样式
function createArticleCSS() {
  const cssDir = path.join(__dirname, '../css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  const articleCssPath = path.join(cssDir, 'article.css');
  const articleCss = `
.article-content {
  max-width: 800px;
  margin: 60px auto 30px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.article-content h1 {
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: #333;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 0.8rem;
}

.article-content h2 {
  font-size: 1.8rem;
  margin: 1.8rem 0 1rem;
  color: #444;
}

.article-content h3 {
  font-size: 1.5rem;
  margin: 1.5rem 0 0.8rem;
  color: #555;
}

.article-content p {
  margin-bottom: 1.2rem;
  line-height: 1.7;
  color: #333;
}

.article-content ul, .article-content ol {
  margin-bottom: 1.2rem;
  padding-left: 2rem;
}

.article-content li {
  margin-bottom: 0.5rem;
  line-height: 1.6;
}

.article-content blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1rem;
  margin-left: 0;
  color: #666;
  font-style: italic;
}

.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1rem 0;
}

.article-content code {
  background-color: #f5f5f5;
  padding: 0.2rem 0.4rem;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}

.article-content pre {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 1.5rem;
}

.article-content pre code {
  padding: 0;
  background-color: transparent;
}

.back-to-home {
  text-align: center;
  margin: 2rem 0 4rem;
}

.back-to-home a {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #f8f8f8;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.back-to-home a:hover {
  background-color: #eaeaea;
  transform: translateY(-2px);
}

/* 文章列表页样式 */
.articles-container {
  max-width: 900px;
  margin: 60px auto 30px;
  padding: 0 20px;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
  color: #333;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  margin-top: 30px;
}

.article-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.article-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
}

.article-card a {
  display: block;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.article-card h3 {
  font-size: 1.2rem;
  margin-bottom: 0.8rem;
  color: #333;
}

.article-meta {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
}

.article-excerpt {
  color: #555;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* 查看更多链接 */
.view-more {
  grid-column: 1 / -1;
  text-align: center;
  margin-top: 20px;
}

.view-more a {
  display: inline-block;
  padding: 10px 25px;
  background-color: #f8f8f8;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.view-more a:hover {
  background-color: #eaeaea;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .article-content {
    padding: 15px;
    margin-top: 50px;
  }
  
  .article-content h1 {
    font-size: 1.8rem;
  }
  
  .article-content h2 {
    font-size: 1.5rem;
  }
  
  .article-content h3 {
    font-size: 1.3rem;
  }
  
  .articles-grid {
    grid-template-columns: 1fr;
  }
}
`;

  fs.writeFileSync(articleCssPath, articleCss);
  console.log(`创建文章样式文件: ${articleCssPath}`);
}

// 从Markdown文件中提取元数据和内容
function extractMarkdownInfo(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    // 从文件名提取slug
    const fileName = path.basename(filePath);
    const slug = fileName.replace('.md', '');
    
    return {
      slug,
      title: data.title || fileName, // 如果没有标题使用文件名
      date: data.date ? new Date(data.date).toISOString().split('T')[0] : '未知日期',
      category: data.category || '未分类',
      excerpt: data.excerpt || content.substring(0, 150).replace(/\n/g, ' ') + '...',
      content
    };
  } catch (error) {
    console.error(`处理文件 ${filePath} 时出错:`, error);
    return null;
  }
}

// 处理每种语言的文章
async function generateArticles() {
  // 创建文章样式
  createArticleCSS();

  // 处理每种语言
  for (const lang of languages) {
    try {
      console.log(`处理 ${lang} 语言的文章...`);
      
      // 读取该语言目录下的所有Markdown文件
      const sourceDir = path.join(rootDir, `articles/${lang}`);
      
      if (!fs.existsSync(sourceDir)) {
        console.warn(`未找到文章目录: ${sourceDir}`);
        continue;
      }
      
      const files = fs.readdirSync(sourceDir);
      const mdFiles = files.filter(file => file.endsWith('.md'));
      
      if (mdFiles.length === 0) {
        console.warn(`${lang} 语言目录下没有找到Markdown文件`);
        continue;
      }
      
      // 处理每个Markdown文件，提取元数据
      const articles = [];
      
      for (const file of mdFiles) {
        const filePath = path.join(sourceDir, file);
        const articleInfo = extractMarkdownInfo(filePath);
        
        if (articleInfo) {
          articles.push(articleInfo);
        }
      }
      
      // 按日期排序文章（最新的在前面）
      articles.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 确保输出目录存在
      const outputDir = path.join(rootDir, `public/articles/${lang}`);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // 创建文章列表页面
      const articleListPath = path.join(outputDir, 'index.html');
      fs.writeFileSync(articleListPath, createArticleListPage(lang, articles));
      console.log(`创建文章列表页面: ${articleListPath}`);
      
      // 为每篇文章生成HTML文件
      for (const article of articles) {
        // 转换内容为HTML
        const htmlContent = marked.parse(article.content);
        
        // 创建完整HTML页面
        const htmlFilePath = path.join(outputDir, `${article.slug}.html`);
        fs.writeFileSync(htmlFilePath, createHtmlTemplate(article.title, htmlContent, lang));
        console.log(`创建文章HTML: ${htmlFilePath}`);
      }
    } catch (error) {
      console.error(`处理 ${lang} 语言文章时出错:`, error);
    }
  }
  
  console.log('文章生成完成!');
}

// 运行生成器
generateArticles().catch(err => {
  console.error('生成文章时发生错误:', err);
}); 