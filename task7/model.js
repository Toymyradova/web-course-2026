(function () {
    "use strict";

    const API_URL = "https://jsonplaceholder.typicode.com/posts";
    const LIMIT = 10;
    const MAX_POSTS = 100;

    const PostsModel = {
        allPosts: [],
        filteredPosts: [],
        currentPage: 1,
        hasMorePosts: true,
        isLoading: false,

        reset: function() {
            this.allPosts = [];
            this.filteredPosts = [];
            this.currentPage = 1;
            this.hasMorePosts = true;
            this.isLoading = false;
        },

        fetchPosts: async function() {
            if (this.isLoading || !this.hasMorePosts) return null;

            this.isLoading = true;

            try {
                const response = await fetch(`${API_URL}?_page=${this.currentPage}&_limit=${LIMIT}`);
                
                if (!response.ok) {
                    throw new Error(`Ошибка сервера: ${response.status}`);
                }

                const data = await response.json();

                if (data.length === 0 || this.allPosts.length + data.length > MAX_POSTS) {
                    this.hasMorePosts = false;
                } else {
                    this.allPosts = this.allPosts.concat(data);
                    this.currentPage++;
                }

                this.filterPosts("");
                return { success: true };

            } catch (error) {
                return { success: false, error: error.message };
            } finally {
                this.isLoading = false;
            }
        },

        filterPosts: function(searchTerm) {
            const term = searchTerm.trim().toLowerCase();
            
            if (term === "") {
                this.filteredPosts = this.allPosts;
            } else {
                this.filteredPosts = this.allPosts.filter(post =>
                    post.title.toLowerCase().includes(term)
                );
            }
            return this.filteredPosts;
        }
    };

    window.PostsModel = PostsModel;
})();