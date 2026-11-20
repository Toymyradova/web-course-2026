(function () {
    "use strict";

    // Находим DOM-элементы
    const postsContainer = document.getElementById('posts');
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('error');
    const emptyEl = document.getElementById('empty');
    const endEl = document.getElementById('end');
    const statsEl = document.getElementById('stats');
    const searchInput = document.getElementById('search');
    const btnUp = document.getElementById('btn-up');

    // 1. Отрисовка постов
    function renderPosts(posts, query = '') {
        postsContainer.innerHTML = '';

        if (posts.length === 0) {
            emptyEl.classList.remove('hidden');
            endEl.classList.add('hidden');
            return;
        }

        emptyEl.classList.add('hidden');

        posts.forEach(post => {
            const card = document.createElement('article');
            card.className = `post-card color-${post.userId % 5}`;

            // Шапка карточки (аватар, автор, id)
            const header = document.createElement('div');
            header.className = 'post-header';

            const author = document.createElement('div');
            author.className = 'post-author';
            
            const avatar = document.createElement('img');
            avatar.className = 'post-avatar';
            avatar.src = `https://i.pravatar.cc/80?img=${post.userId}`;
            avatar.alt = `Автор ${post.userId}`;
            avatar.loading = 'lazy';

            const authorName = document.createElement('span');
            authorName.textContent = `Автор ${post.userId}`;
            author.append(avatar, authorName);

            const id = document.createElement('span');
            id.className = 'post-id';
            id.textContent = `#${post.id}`;
            header.append(author, id);

            // Заголовок (с подсветкой поиска)
            const title = document.createElement('h2');
            title.className = 'post-title';
            highlightText(title, post.title, query);

            // Текст
            const body = document.createElement('p');
            body.className = 'post-body';
            body.textContent = post.body;

            card.append(header, title, body);
            postsContainer.appendChild(card);
        });
    }

    // 2. Подсветка найденного текста в заголовке
    function highlightText(element, text, query) {
        if (!query) {
            element.textContent = text;
            return;
        }

        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        let lastIndex = 0;
        let index = lowerText.indexOf(lowerQuery);

        if (index === -1) {
            element.textContent = text;
            return;
        }

        while (index !== -1) {
            element.appendChild(document.createTextNode(text.slice(lastIndex, index)));
            
            const mark = document.createElement('mark');
            mark.textContent = text.slice(index, index + query.length);
            element.appendChild(mark);

            lastIndex = index + query.length;
            index = lowerText.indexOf(lowerQuery, lastIndex);
        }

        if (lastIndex < text.length) {
            element.appendChild(document.createTextNode(text.slice(lastIndex)));
        }
    }

    // 3. Управление состояниями (загрузка, ошибки, конец)
    function setLoading(isLoading) {
        if (isLoading) loadingEl.classList.remove('hidden');
        else loadingEl.classList.add('hidden');
    }

    function showError(message) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
    }

    function hideError() {
        errorEl.classList.add('hidden');
    }

    function showEnd() { endEl.classList.remove('hidden'); }
    function hideEnd() { endEl.classList.add('hidden'); }

    function updateStats(loaded, total) {
        statsEl.textContent = `Загружено: ${loaded} из ${total}`;
    }

    function setBtnUpVisible(visible) {
        if (visible) btnUp.classList.remove('hidden');
        else btnUp.classList.add('hidden');
    }

    // 4. Экспорт
    window.PostsView = {
        renderPosts,
        setLoading,
        showError,
        hideError,
        showEnd,
        hideEnd,
        updateStats,
        setBtnUpVisible,
        searchInput,
        btnUp
    };
})();