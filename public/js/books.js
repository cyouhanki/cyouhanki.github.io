document.addEventListener('DOMContentLoaded', function() {
    const books = [
        {
            title: "The Tree of Gnosis Gnostic Mythology from Early Christianity to Modern Nihilism ",
            author: "loan P. Couliano",
            image: "images/books/The Tree of Gnosis Gnostic Mythology from Early Christianity to Modern Nihilism .png",
            category: "Major",
            tags: ["Gnosticism", "Christianity", "Modern Nihilism"]
        },
        {
            title: "宗教社会学の基礎",
            author: "井上 順孝",
            image: "images/books/religion_sociology.jpg",
            category: "Major",
            tags: ["宗教学", "社会学", "理論"]
        },
        {
            title: "1984",
            author: "George Orwell",
            image: "images/books/1984.jpg",
            category: "Novel",
            tags: ["Dystopia", "Political Fiction", "Classic"]
        },
        {
            title: "三体",
            author: "刘慈欣",
            image: "images/books/three_body.jpg",
            category: "Novel",
            tags: ["科幻", "硬科幻", "获奖作品"]
        },
        {
            title: "The Pragmatic Programmer",
            author: "Andrew Hunt & David Thomas",
            image: "images/books/pragmatic_programmer.jpg",
            category: "Technical",
            tags: ["Programming", "Best Practices", "Software Engineering"]
        },
        {
            title: "The Rust Programming Language",
            author: "Steve Klabnik & Carol Nichols",
            image: "images/books/rust_book.jpg",
            category: "Technical",
            tags: ["Rust", "Programming Language", "Systems"]
        },
        {
            title: "CSS In Depth",
            author: "Keith J. Grant",
            image: "images/books/css_depth.jpg",
            category: "Technical",
            tags: ["CSS", "Web Development", "Frontend"]
        },
        {
            title: "Up & Going",
            author: "Kyle Simpson",
            image: "images/books/up_going.jpg",
            category: "Technical",
            tags: ["JavaScript", "Programming", "Web"]
        },
        {
            title: "Programming C# 8.0",
            author: "Ian Griffiths",
            image: "images/books/csharp_8.jpg",
            category: "Technical",
            tags: ["C#", ".NET", "Programming"]
        },
        {
            title: "TypeScript Deep Dive",
            author: "Basarat Ali Syed",
            image: "images/books/typescript_dive.jpg",
            category: "Technical",
            tags: ["TypeScript", "JavaScript", "Programming"]
        },
        {
            title: "Code Complete 2",
            author: "Steve McConnell",
            image: "images/books/code_complete.jpg",
            category: "Technical",
            tags: ["Software Engineering", "Best Practices"]
        }
    ];

    const booksGrid = document.querySelector('.books-grid');
    const categoryTags = document.querySelectorAll('.category-tag');

    function createBookCard(book) {
        return `
            <div class="book-card">
                <img src="${book.image}" alt="${book.title}" class="book-image">
                <div class="book-info">
                    <h3 class="book-title">${book.title}</h3>
                    <p class="book-author">${book.author}</p>
                    <div class="book-tags">
                        ${book.tags.map(tag => `<span class="book-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    function filterBooks(category) {
        const filteredBooks = category === 'all' 
            ? books 
            : books.filter(book => book.category === category);
        
        booksGrid.innerHTML = filteredBooks.map(createBookCard).join('');
    }

    // 初始化显示 Major 类别的书籍
    filterBooks('Major');

    // 添加分类标签点击事件
    categoryTags.forEach(tag => {
        tag.addEventListener('click', () => {
            categoryTags.forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            filterBooks(tag.textContent.split('(')[0].trim());
        });
    });
}); 