(function () {
    "use strict";

    const Controller = {
        model: null,
        view: null,

        init: function (model, view) {
            this.model = model;
            this.view = view;

            this.view.init();
            this.bindEvents();
            this.loadNextPage();
        },

        bindEvents: function () {
            const self = this;

            window.addEventListener("scroll", function () {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const windowHeight = window.innerHeight;
                const documentHeight = document.documentElement.scrollHeight;

                if (scrollTop + windowHeight >= documentHeight - 200) {
                    self.loadNextPage();
                }
            });

            this.view.bindSearch(function (searchTerm) {
                const filtered = self.model.filterPosts(searchTerm);
                self.view.renderPosts(filtered);
            });
        },

        loadNextPage: async function () {
            if (this.model.isLoading || !this.model.hasMorePosts) return;

            this.view.showLoader(true);
            this.view.hideError();

            const result = await this.model.fetchPosts();

            this.view.showLoader(false);

            if (result && result.success) {
                this.view.renderPosts(this.model.filteredPosts);
                if (!this.model.hasMorePosts) {
                    this.view.showEndMessage();
                }
            } else if (result) {
                this.view.showError(`Не удалось загрузить посты: ${result.error}`);
            }
        }
    };

    document.addEventListener("DOMContentLoaded", function () {
        Controller.init(window.PostsModel, window.PostsView);
    });
})();