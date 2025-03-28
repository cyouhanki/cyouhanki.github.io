// 加载书籍列表
async function loadBooks() {
    const booksGrid = document.querySelector('.books-grid');
    if (!booksGrid) return;

    try {
        const response = await fetch('/books.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const books = await response.json();

        books.forEach(book => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='images/placeholder.jpg'">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                <p class="description">${book.description}</p>
            `;
            booksGrid.appendChild(bookCard);
        });
    } catch (error) {
        console.error('Error loading books:', error);
        booksGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                ${getCurrentLanguage() === 'en' ? 'No books found.' :
                  getCurrentLanguage() === 'jp' ? '本が見つかりません。' :
                  '没有找到书籍。'}
            </div>
        `;
    }
}

// 获取当前语言
function getCurrentLanguage() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/en/')) return 'en';
    if (currentPath.includes('/jp/')) return 'jp';
    return 'zh';
}

// 加载文章列表
async function loadArticles() {
    try {
        const basePath = window.location.pathname.includes('/site_pure/') ? '/site_pure' : '';
        
        // 加载所有语言的文章
        const [zhArticles, enArticles, jpArticles] = await Promise.all([
            fetch(`${basePath}/articles/zh-articles.json`).then(res => res.json()),
            fetch(`${basePath}/articles/en-articles.json`).then(res => res.json()),
            fetch(`${basePath}/articles/jp-articles.json`).then(res => res.json())
        ]);

        // 合并所有文章并按日期排序
        const allArticles = [...zhArticles, ...enArticles, ...jpArticles]
            .filter(article => article.title && article.date)
            .map(article => {
                // 从文章路径中提取语言信息
                let language;
                let slug = article.slug;
                
                // 移除开头的斜杠（如果存在）
                if (slug.startsWith('/')) {
                    slug = slug.substring(1);
                }
                
                // 根据文章来源确定语言
                if (zhArticles.includes(article)) {
                    language = 'zh';
                } else if (enArticles.includes(article)) {
                    language = 'en';
                } else if (jpArticles.includes(article)) {
                    language = 'jp';
                } else {
                    language = detectLanguage(article.title);
                }
                
                return { ...article, language, slug };
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        const articlesContainer = document.querySelector('.articles-list');
        if (!articlesContainer) return;

        articlesContainer.innerHTML = '';
        
        const gridContainer = document.createElement('div');
        gridContainer.className = 'articles-grid';
        
        allArticles.forEach(article => {
            const card = document.createElement('article');
            card.className = 'article-card';
            
            const languageText = {
                'zh': '中文',
                'en': 'English',
                'jp': '日本語'
            }[article.language] || article.language;

            // 修复文章URL路径
            const articleUrl = `${basePath}/articles/${article.language}/${article.slug}.html`;

            card.innerHTML = `
                <a href="${articleUrl}">
                    <div class="article-card-content">
                        <h3>${article.title}</h3>
                        <div class="meta">
                            <time>${article.date}</time>
                            <span class="category">${article.category}</span>
                            <span class="language">${languageText}</span>
                        </div>
                        <p class="excerpt">${article.excerpt}</p>
                    </div>
                </a>
            `;
            
            gridContainer.appendChild(card);
        });
        
        articlesContainer.appendChild(gridContainer);
    } catch (error) {
        console.error('Error loading articles:', error);
        const articlesContainer = document.querySelector('.articles-list');
        if (articlesContainer) {
            articlesContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    ${getCurrentLanguage() === 'en' ? 'Failed to load articles.' :
                      getCurrentLanguage() === 'jp' ? '記事の読み込みに失敗しました。' :
                      '加载文章失败。'}
                </div>
            `;
        }
    }
}

// 根据文本检测语言的辅助函数
function detectLanguage(text) {
    const hasJapanese = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/.test(text);
    const hasChinese = /[\u4e00-\u9fff]/.test(text);
    const hasEnglish = /[a-zA-Z]/.test(text);
    
    if (hasJapanese && !hasChinese) return 'jp';
    if (hasChinese) return 'zh';
    if (hasEnglish) return 'en';
    return 'unknown';
}

// 移动端菜单切换
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navRight = document.querySelector('.nav-right');

    if (!menuToggle || !navRight) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navRight.classList.toggle('active');
    });

    // 点击导航链接时关闭菜单
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navRight.classList.remove('active');
        });
    });
}

// 语言切换功能
function initLanguageSwitcher() {
    const languageSwitcher = document.querySelector('.language-switcher');
    if (!languageSwitcher) return;

    languageSwitcher.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            const lang = e.target.getAttribute('data-lang');
            const currentPath = window.location.pathname;
            const basePath = currentPath.includes('/site_pure/') ? '/site_pure' : '';
            
            const langPaths = {
                'zh': `${basePath}/index.html`,
                'en': `${basePath}/en/index.html`,
                'jp': `${basePath}/jp/index.html`
            };

            if (langPaths[lang]) {
                window.location.href = langPaths[lang];
            }
        }
    });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
    loadArticles();
    initMobileMenu();
    initLanguageSwitcher();
}); 
