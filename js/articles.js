// 获取当前语言
function getCurrentLanguage() {
    const path = window.location.pathname;
    if (path.includes('/zh/')) return 'zh';
    if (path.includes('/en/')) return 'en';
    if (path.includes('/jp/')) return 'jp';
    return 'zh'; // 默认中文
}

// 加载文章列表
async function loadArticles() {
    const lang = getCurrentLanguage();
    const articlesGrid = document.querySelector('.articles-grid');
    if (!articlesGrid) return;

    try {
        // 添加时间戳防止缓存
        const timestamp = new Date().getTime();
        const response = await fetch(`/articles/${lang}-articles.json?t=${timestamp}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const articles = await response.json();

        // 按日期排序
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        // 清空现有内容
        articlesGrid.innerHTML = '';

        // 添加文章卡片
        articles.forEach(article => {
            const card = document.createElement('article');
            card.className = 'article-card';
            
            const date = new Date(article.date).toLocaleDateString(
                lang === 'jp' ? 'ja-JP' : 
                lang === 'en' ? 'en-US' : 
                'zh-CN'
            );

            card.innerHTML = `
                <a href="./articles/${lang}/${article.slug}.html">
                    <div class="article-card-content">
                        <h2>${article.title}</h2>
                        <div class="meta">
                            <time>${date}</time>
                            <span class="category">${article.category}</span>
                        </div>
                        <p class="excerpt">${article.excerpt}</p>
                    </div>
                </a>
            `;
            
            articlesGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading articles:', error);
        articlesGrid.innerHTML = `
            <div class="error-message">
                ${lang === 'en' ? 'Failed to load articles.' :
                  lang === 'jp' ? '記事の読み込みに失敗しました。' :
                  '加载文章失败。'}
            </div>
        `;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadArticles();
}); 