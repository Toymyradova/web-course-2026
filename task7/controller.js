(function () {
    "use strict";

    let searchTimeout = null;
    let currentQuery = '';

    // 1. Загрузка порции постов
    async function loadMore() {
        const model = window.PostsModel;
        const view = window.PostsView;

        if (model.getIsLoading() || !model.getHasMore()) return;

        view.setLoading(true);
        view.hideError();

        await model.loadNextPage();

        view.setLoading(false);

        if (model.getError()) {
            view.showError(model.getError());
            return;
        }

        // Фильтруем или берем все
        const postsToRender = currentQuery 
            ? model.filterPosts(currentQuery) 
            : model.getPosts();

        view.renderPosts(postsToRender, currentQuery);
        
        view.updateStats(model.getTotalLoaded(), model.getTotalPosts());

        if (!model.getHasMore() && !currentQuery) {
            view.showEnd();
        }
    }

    // 2. Обработка поиска (с дебаунсом)
    function handleSearch(query) {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            const model = window.PostsModel;
            const view = window.PostsView;

            currentQuery = query.trim();
            const filtered = model.filterPosts(currentQuery);

            view.renderPosts(filtered, currentQuery);

            if (currentQuery) {
                view.hideEnd();
            } else if (!model.getHasMore()) {
                view.showEnd();
            }
        }, 300); // Задержка 300 мс
    }

    // 3. Обработка скролла (бесконечная лента)
    function handleScroll() {
        // Показываем кнопку "Наверх"
        if (window.scrollY > 500) {
            window.PostsView.setBtnUpVisible(true);
        } else {
            window.PostsView.setBtnUpVisible(false);
        }

        // Проверяем, доскроллили ли до конца (200px)
        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 200) {
            // Если поиск пуст — подгружаем новые посты
            if (!currentQuery) {
                loadMore();
            }
        }
    }

    // 4. Инициализация
    function init() {
        const view = window.PostsView;

        // Слушаем ввод в поиск
        view.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));

        // Слушаем скролл
        window.addEventListener('scroll', handleScroll);

        // Кнопка "Наверх"
        view.btnUp.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Загружаем первую порцию
        loadMore();
    }

    // Запуск после загрузки HTML
    document.addEventListener('DOMContentLoaded', init);
})();