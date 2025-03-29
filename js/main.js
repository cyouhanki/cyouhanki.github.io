// 加载文章列表
async function loadArticles() {
  const articlesContainer = document.querySelector('.articles-list');
  if (!articlesContainer) return;
  
  try {
    // 获取当前页面路径
    const currentPath = window.location.pathname;
    let articles = [];
    
    // 根据页面类型决定加载哪些文章
    if (currentPath === '/' || currentPath === '/index.html' || 
        currentPath === '/site_pure/' || currentPath === '/site_pure/index.html') {
      // 首页：加载所有语言的最新文章
      const languages = ['zh', 'en', 'jp'];
      for (const lang of languages) {
        try {
          // 根据环境使用不同的路径
          const jsonPath = currentPath.includes('site_pure') ? 
            `/site_pure/articles/${lang}-articles.json` : 
            `./articles/${lang}-articles.json`;
            
          const response = await fetch(jsonPath);
          if (response.ok) {
            const langArticles = await response.json();
            articles = articles.concat(langArticles.map(article => ({...article, lang})));
          }
        } catch (error) {
          console.error(`Error loading ${lang} articles:`, error);
        }
      }
    } else {
      // 语言特定页面：只加载对应语言的文章
      const lang = getCurrentLanguage();
      try {
        // 根据环境和页面位置使用不同的路径
        let jsonPath;
        if (currentPath.includes('site_pure')) {
          // GitHub Pages环境
          jsonPath = `/site_pure/articles/${lang}-articles.json`;
        } else if (currentPath.includes('/articles/')) {
          // 在articles子目录中
          jsonPath = `../${lang}-articles.json`;
        } else {
          // 其他情况
          jsonPath = `./articles/${lang}-articles.json`;
        }
          
        console.log('Fetching articles from:', jsonPath); // 添加调试日志
        const response = await fetch(jsonPath);
        if (response.ok) {
          articles = await response.json();
          articles = articles.map(article => ({...article, lang}));
        } else {
          console.error('Failed to fetch articles:', response.status, response.statusText);
        }
      } catch (error) {
        console.error(`Error loading ${lang} articles:`, error);
      }
    }
    
    // 按日期排序并只显示最新的10篇文章
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestArticles = articles.slice(0, 10);
    
    if (latestArticles.length === 0) {
      const noArticlesText = {
        'zh': '暂无文章',
        'en': 'No articles found',
        'jp': '記事が見つかりません'
      }[getCurrentLanguage()] || '暂无文章';
      
      articlesContainer.innerHTML = `<p class="no-articles">${noArticlesText}</p>`;
      return;
    }
    
    const articlesList = document.createElement('div');
    articlesList.className = 'articles-grid';
    
    latestArticles.forEach(article => {
      const articleCard = document.createElement('article');
      articleCard.className = 'article-card';
      
      // 只在首页显示语言标签
      const langHtml = currentPath === '/' || currentPath === '/index.html' || 
        currentPath.includes('site_pure') ? 
        `<span class="article-lang">${{
            'zh': '中文',
            'en': 'English',
            'jp': '日本語'
          }[article.lang]}</span>` : 
        '';
      
      // 根据环境使用不同的路径
      let articleLink = '';
      if (currentPath === '/' || currentPath === '/index.html') {
        articleLink = `./articles/${article.lang}/${article.slug}.html`;
      } else if (currentPath.includes('site_pure')) {
        articleLink = `/site_pure/articles/${article.lang}/${article.slug}.html`;
      } else {
        articleLink = `../${article.lang}/${article.slug}.html`;
      }
      
      articleCard.innerHTML = `
        <a href="${articleLink}">
          <div class="article-card-inner">
            <h3 class="article-title">${article.title}</h3>
            <div class="article-meta">
              <span class="article-date">${article.date}</span>
              <span class="article-category">${article.category}</span>
              ${langHtml}
            </div>
            <p class="article-excerpt">${article.excerpt}</p>
          </div>
        </a>
      `;
      
      articlesList.appendChild(articleCard);
    });
    
    // 添加"查看更多"链接
    const viewMoreText = {
      'zh': '查看更多文章',
      'en': 'View More Articles',
      'jp': 'もっと見る'
    }[getCurrentLanguage()] || '查看更多文章';
    
    // 根据当前页面位置设置"查看更多"链接
    let viewMoreLink = document.createElement('div');
    viewMoreLink.className = 'view-more';
    
    let allArticlesLink = '';
    if (currentPath === '/' || currentPath === '/index.html') {
      allArticlesLink = './articles/all';
    } else if (currentPath.includes('site_pure')) {
      allArticlesLink = '/site_pure/articles/all';
    } else {
      // 其他页面使用相对路径
      allArticlesLink = '../all';
    }
    
    viewMoreLink.innerHTML = `<a href="${allArticlesLink}">${viewMoreText}</a>`;
    articlesList.appendChild(viewMoreLink);
    
    articlesContainer.innerHTML = '';
    articlesContainer.appendChild(articlesList);
    
    // 添加动画效果
    const articleCards = document.querySelectorAll('.article-card');
    articleCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
      card.classList.add('fade-in');
    });
    
  } catch (error) {
    console.error('Error loading articles:', error);
    const errorText = {
      'zh': '加载文章失败，请稍后再试。',
      'en': 'Failed to load articles. Please try again later.',
      'jp': '記事の読み込みに失敗しました。後でもう一度お試しください。'
    }[getCurrentLanguage()] || '加载文章失败，请稍后再试。';
    
    articlesContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #666;">
        ${errorText}
      </div>
    `;
  }
}

// 获取当前语言
function getCurrentLanguage() {
  const currentPath = window.location.pathname;
  if (currentPath.includes('/articles/en/') || currentPath.includes('/en/')) return 'en';
  if (currentPath.includes('/articles/jp/') || currentPath.includes('/jp/')) return 'jp';
  if (currentPath.includes('/articles/zh/') || currentPath.includes('/zh/')) return 'zh';
  return 'zh';
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // 初始化移动端菜单
    initMobileMenu();
    
    // 初始化分类标签
    initCategoryTags();
    
    // 加载书籍
    loadBooks();
    
    // 加载文章
    loadArticles();
    
    // 初始化时间和空间分布图表（如果存在）
    if (document.getElementById('timeChart')) {
        initTimeChart();
    }
    
    if (document.getElementById('map')) {
        initMap();
    }
});

// 初始化时间分布图表
function initTimeChart() {
  const ctx = document.getElementById('timeChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025'],
      datasets: [
        {
          label: 'CSS+HTML',
          data: [50, 50, 25, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(152, 251, 152, 0.6)',
          borderWidth: 0,
          fill: 'origin',
          tension: 0.4
        },
        {
          label: '日语',
          data: [50, 50, 25, 100, 100, 100, 100, 25],
          backgroundColor: 'rgba(173, 216, 230, 0.6)',
          borderWidth: 0,
          fill: '-1',
          tension: 0.4
        },
        {
          label: 'C#',
          data: [0, 0, 50, 0, 0, 0, 0, 0],
          backgroundColor: 'rgba(135, 206, 250, 0.6)',
          borderWidth: 0,
          fill: '-1',
          tension: 0.4
        },
        {
          label: 'Python',
          data: [0, 0, 0, 0, 0, 0, 0, 20],
          backgroundColor: 'rgba(176, 196, 222, 0.6)',
          borderWidth: 0,
          fill: '-1',
          tension: 0.4
        },
        {
          label: 'AI工具',
          data: [0, 0, 0, 0, 0, 0, 0, 50],
          backgroundColor: 'rgba(100, 149, 237, 0.6)',
          borderWidth: 0,
          fill: '-1',
          tension: 0.4
        },
        {
          label: 'Swift',
          data: [0, 0, 0, 0, 0, 0, 0, 5],
          backgroundColor: 'rgba(255, 182, 193, 0.6)',
          borderWidth: 0,
          fill: '-1',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          stacked: true,
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            borderDash: [2, 2],
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      elements: {
        point: {
          radius: 0
        }
      }
    }
  });
  
  // 添加图表中的文本标签
  addChartLabels();
}

// 添加图表中的文本标签
function addChartLabels() {
  setTimeout(() => {
    const canvas = document.getElementById('timeChart');
    const chart = Chart.getChart(canvas);
    
    if (!chart) return;
    
    const ctx = chart.ctx;
    const chartArea = chart.chartArea;
    
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'start';
    
    // CSS+HTML - 顶部位置
    ctx.fillStyle = '#333';
    ctx.fillText('CSS+HTML', chartArea.left + chartArea.width * 0.2, chartArea.top + 30);
    
    // 日语 - 中上位置
    ctx.fillText('日语', chartArea.left + chartArea.width * 0.4, chartArea.top + chartArea.height * 0.3);
    
    // C# - 中间位置
    ctx.fillText('C#', chartArea.left + chartArea.width * 0.3, chartArea.top + chartArea.height * 0.5);
    
    // Python - 右侧位置
    ctx.fillText('Python', chartArea.left + chartArea.width * 0.75, chartArea.top + chartArea.height * 0.6);
    
    // AI工具 - 右上位置
    ctx.fillText('AI工具', chartArea.left + chartArea.width * 0.8, chartArea.top + chartArea.height * 0.4);
    
    // Swift - 右下位置
    ctx.fillText('Swift', chartArea.left + chartArea.width * 0.85, chartArea.top + chartArea.height * 0.7);
  }, 100);
}

// 初始化地图
function initMap() {
  // 创建地图并设置中心点和缩放级别（以札幌为中心）
  const map = L.map('map').setView([43.0618, 141.3545], 3);

  // 添加地图图层
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // 创建自定义头像图标
  const customIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="avatar-marker" style="
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #fff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      background: #fff;
    ">
      <img src="./self1.png" style="
        width: 100%;
        height: 100%;
        object-fit: cover;
      ">
    </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });

  // 添加当前位置（札幌）的头像标记
  L.marker([43.0618, 141.3545], {icon: customIcon})
    .addTo(map)
    .bindPopup('现在在札幌');

  // 定义去过的地方
  const visitedPlaces = [
    { name: '台湾', location: [23.5, 121.5], type: 'region' },
    { name: '香港', location: [22.3193, 114.1694], type: 'city' },
    { name: '澳门', location: [22.1987, 113.5439], type: 'city' },
    { name: '韩国', location: [35.9078, 127.7669], type: 'country' },
    { name: '马尔代夫', location: [3.2028, 73.2207], type: 'country' },
    { name: '突尼斯', location: [33.8869, 9.5375], type: 'country' },
    { name: '摩洛哥', location: [31.7917, -7.0926], type: 'country' }
  ];

  // 为不同类型的地点创建不同的图标
  const icons = {
    city: L.divIcon({
      className: 'place-marker city-marker',
      html: '<div style="background: #FF9800; width: 12px; height: 12px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    }),
    region: L.divIcon({
      className: 'place-marker region-marker',
      html: '<div style="background: #4CAF50; width: 14px; height: 14px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
      iconSize: [18, 18],
      iconAnchor: [9, 9]
    }),
    country: L.divIcon({
      className: 'place-marker country-marker',
      html: '<div style="background: #2196F3; width: 16px; height: 16px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    })
  };

  // 为每个地点添加标记
  visitedPlaces.forEach(place => {
    const marker = L.marker(place.location, {
      icon: icons[place.type]
    }).addTo(map);

    // 创建自定义弹出框
    const popupContent = `
      <div style="
        padding: 5px 10px;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
      ">
        <strong>${place.name}</strong>
      </div>
    `;

    marker.bindPopup(popupContent, {
      className: 'custom-popup',
      offset: [0, -5]
    });

    // 添加鼠标悬停效果
    marker.on('mouseover', function() {
      this.openPopup();
    });
    marker.on('mouseout', function() {
      this.closePopup();
    });
  });

  // 添加连接线，创建旅行路径
  const pathCoordinates = visitedPlaces.map(place => place.location);
  pathCoordinates.unshift([43.0618, 141.3545]); // 添加札幌作为起点

  const path = L.polyline(pathCoordinates, {
    color: '#3388ff',
    weight: 2,
    opacity: 0.6,
    dashArray: '5, 10',
    animate: true
  }).addTo(map);

  // 添加渐变效果
  const gradient = {
    0.0: '#3388ff',
    1.0: '#32cd32'
  };
  
  path.setStyle({
    gradient: gradient
  });
}

// 定义全局书籍数据
const books = [
    {
        title: "波兰人",
        author: "John Maxwel Coetzee",
        cover: "./images/books/Polish_man.jpeg",
        category: "Novel",
        description: "一本关于波兰人的小说。"
    },
    {
        title: "The Routledge Handbook of Research Method in the Study of Religion",
        author: "Steven Engler and Michael Stausberg",
        cover: "./images/books/The%20Routledge%20Handbook%20of%20Research%20Method%20in%20the%20Study%20of%20Religion.png",
        category: "Major",
        description: "宗教研究方法的权威指南。"
    },
    {
        title: "穿过针眼",
        author: "彼得布朗",
        cover: "./images/books/穿过针眼（彼得布朗）.png",
        category: "Major",
        description: "关于早期基督教财富观的研究。"
    },
    {
        title: "古代诺斯替主义经典文集",
        author: "张新樟",
        cover: "./images/books/古代诺斯替主义经典文集（张新樟）.png",
        category: "Major",
        description: "诺斯替主义经典文献汇编。"
    },
    {
        title: "夹边沟记事",
        author: "杨显惠",
        cover: "./images/books/夹边沟记事.png",
        category: "Novel",
        description: "一部反映历史的小说。"
    },
    {
        title: "The Tree of Gnosis",
        author: "loan P. Couliano",
        cover: "./images/books/The%20Tree%20of%20Gnosis%20Gnostic%20Mythology%20from%20Early%20Christianity%20to%20Modern%20Nihilism%20.png",
        category: "Major",
        description: "A comprehensive study of Gnostic mythology from early Christianity to modern nihilism."
    },
    {
        title: "聖母",
        author: "秋吉理香子",
        cover: "./images/books/聖母秋吉理香子.png",
        category: "Novel",
        description: "推理小说、面白い."
    }
];

// 加载书籍列表
function loadBooks() {
    const booksGrid = document.querySelector('.books-grid');
    if (!booksGrid) {
        console.error('Books grid element not found');
        return;
    }

    try {
        console.log('Loading books...');
        booksGrid.innerHTML = '';
        
        // 根据当前激活的分类标签过滤书籍
        const activeCategory = document.querySelector('.category-tag.active');
        console.log('Active category element:', activeCategory);
        
        if (!activeCategory) {
            console.error('No active category found');
            return;
        }
        
        const categoryName = activeCategory.textContent.split('\n')[0].trim();
        console.log('Active category name:', categoryName);
        
        const filteredBooks = categoryName === 'All' 
            ? books 
            : books.filter(book => book.category === categoryName);
            
        console.log('Filtered books:', filteredBooks);
        
        if (filteredBooks.length === 0) {
            console.log('No books found for category:', categoryName);
            booksGrid.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #666;">
                    该分类下暂无书籍。
                </div>
            `;
            return;
        }
            
        filteredBooks.forEach(book => {
            console.log('Creating book card for:', book.title);
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <img src="${book.cover}" alt="${book.title}" onerror="this.src='./images/placeholder.jpg'">
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <p class="book-description">${book.description}</p>
                </div>
            `;
            booksGrid.appendChild(bookCard);
        });
    } catch (error) {
        console.error('Error loading books:', error);
        booksGrid.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                加载书籍时出错，请稍后再试。
            </div>
        `;
    }
}

// 移动端菜单切换
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) {
        console.error('Menu elements not found:', {
            menuToggle: !!menuToggle,
            navLinks: !!navLinks
        });
        return;
    }

    console.log('Initializing mobile menu');

    // 点击菜单按钮时
    menuToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Menu button clicked');
        
        const isActive = this.classList.contains('active');
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        console.log('Menu state:', {
            isActive: !isActive,
            menuToggleActive: this.classList.contains('active'),
            navLinksActive: navLinks.classList.contains('active')
        });
    });

    // 点击导航链接时关闭菜单
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            console.log('Navigation link clicked');
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // 点击页面其他区域时关闭菜单
    document.addEventListener('click', function(e) {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            const isMenuActive = navLinks.classList.contains('active');
            if (isMenuActive) {
                console.log('Clicking outside menu');
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        }
    });
}

// 初始化分类标签点击事件
function initCategoryTags() {
    const categoryTags = document.querySelectorAll('.category-tag');
    
    if (!categoryTags.length) {
        console.error('No category tags found');
        return;
    }
    
    console.log('Initializing category tags:', categoryTags.length);
    
    // 计算每个分类的书籍数量
    const categoryCounts = {};
    books.forEach(book => {
        categoryCounts[book.category] = (categoryCounts[book.category] || 0) + 1;
    });

    // 更新分类标签的数量
    categoryTags.forEach(tag => {
        const category = tag.textContent.trim();
        const count = categoryCounts[category] || 0;
        tag.setAttribute('data-count', count);
    });
    
    categoryTags.forEach(tag => {
        console.log('Setting up click handler for tag:', tag.textContent);
        tag.addEventListener('click', function() {
            console.log('Category tag clicked:', this.textContent);
            
            // 移除所有标签的active类
            categoryTags.forEach(t => t.classList.remove('active'));
            
            // 设置当前标签为active
            this.classList.add('active');
            
            // 重新加载书籍
            loadBooks();
        });
    });
}

// 添加技能条动画
function initSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillBar = entry.target.querySelector('.skill-bar');
                const percentage = skillBar.getAttribute('data-percentage');
                
                // 延迟一点时间再执行动画，让用户有时间看到初始状态
                setTimeout(() => {
                    skillBar.style.width = percentage + '%';
                }, 300);
                
                // 停止观察已经显示的元素
                observer.unobserve(entry.target);
            }
        });
    }, {threshold: 0.3});
    
    // 开始观察所有技能项
    skillItems.forEach(item => {
        observer.observe(item);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
        });
    }
    
    // 初始化技能条动画
    initSkillBars();
    
    // 其他已有的初始化代码...
}); 