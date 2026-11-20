(function () {
    "use strict";

    let searchTimeout = null;
    let currentQuery = '';

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

        const postsToRender = currentQuery 
            ? model.filterPosts(currentQuery) 
            : model.getPosts();

        view.renderPosts(postsToRender, currentQuery);
        view.updateStats(model.getTotalLoaded(), model.getTotalPosts());

        if (!model.getHasMore() && !currentQuery) {
            view.showEnd();
        }
    }

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
        }, 300);
    }

    function handleScroll() {
        if (window.scrollY > 500) {
            window.PostsView.setBtnUpVisible(true);
        } else {
            window.PostsView.setBtnUpVisible(false);
        }

        const scrollTop = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        if (scrollTop + windowHeight >= documentHeight - 200) {
            if (!currentQuery) {
                loadMore();
            }
        }
    }

    function init() {
        const view = window.PostsView;

        view.searchInput.addEventListener('input', (e) => handleSearch(e.target.value));
        window.addEventListener('scroll', handleScroll);

        view.btnUp.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        loadMore();
    }

    document.addEventListener('DOMContentLoaded', init);
})();