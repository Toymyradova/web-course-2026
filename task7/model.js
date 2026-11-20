(function () {
    "use strict";

    const API_URL = 'https://jsonplaceholder.typicode.com/posts';
    const POSTS_PER_PAGE = 10;
    const TOTAL_POSTS = 100;

    let allPosts = [];
    let currentPage = 1;
    let isLoading = false;
    let hasMore = true;
    let errorMsg = null;

    async function loadNextPage() {
        if (isLoading || !hasMore) return;

        isLoading = true;
        errorMsg = null;

        try {
            const start = (currentPage - 1) * POSTS_PER_PAGE;
            const response = await fetch(`${API_URL}?_start=${start}&_limit=${POSTS_PER_PAGE}`);

            if (!response.ok) {
                throw new Error(`Ошибка сети: ${response.status}`);
            }

            const newPosts = await response.json();

            if (newPosts.length === 0) {
                hasMore = false;
            } else {
                allPosts = allPosts.concat(newPosts);
                currentPage++;
            }

        } catch (err) {
            console.error(err);
            errorMsg = 'Не удалось загрузить посты. Проверьте интернет.';
        } finally {
            isLoading = false;
        }
    }

    function filterPosts(query) {
        if (!query) return allPosts;
        const lowerQuery = query.trim().toLowerCase();
        return allPosts.filter(post => post.title.toLowerCase().includes(lowerQuery));
    }

    function getPosts() { return allPosts; }
    function getIsLoading() { return isLoading; }
    function getHasMore() { return hasMore; }
    function getError() { return errorMsg; }
    function getTotalLoaded() { return allPosts.length; }
    function getTotalPosts() { return TOTAL_POSTS; }

    window.PostsModel = {
        loadNextPage,
        filterPosts,
        getPosts,
        getIsLoading,
        getHasMore,
        getError,
        getTotalLoaded,
        getTotalPosts
    };
})();