(function () {
    "use strict";

    const View = {
        elements: {},

        init: function () {
            this.elements = {
                postsContainer: document.getElementById("posts-container"),
                loader: document.getElementById("loader"),
                errorMessage: document.getElementById("error-message"),
                endMessage: document.getElementById("end-message"),
                searchInput: document.getElementById("search-input")
            };
        },

        renderPosts: function (posts) {
            this.elements.postsContainer.innerHTML = "";

            if (posts.length === 0) {
                this.elements.postsContainer.innerHTML = "<p style='text-align:center; width:100%;'>По вашему запросу ничего не найдено.</p>";
                return;
            }

            const fragment = document.createDocumentFragment();

            posts.forEach(post => {
                const card = document.createElement("div");
                card.className = "post-card";

                const title = document.createElement("h2");
                title.textContent = post.title;

                const meta = document.createElement("span");
                meta.className = "post-meta";
                meta.textContent = `Автор ID: ${post.userId}`;

                const body = document.createElement("p");
                body.textContent = post.body;

                card.appendChild(title);
                card.appendChild(meta);
                card.appendChild(body);
                fragment.appendChild(card);
            });

            this.elements.postsContainer.appendChild(fragment);
        },

        showLoader: function (show) {
            if (show) {
                this.elements.loader.classList.remove("hidden");
            } else {
                this.elements.loader.classList.add("hidden");
            }
        },

        showError: function (message) {
            this.elements.errorMessage.textContent = message;
            this.elements.errorMessage.classList.remove("hidden");
        },

        hideError: function () {
            this.elements.errorMessage.classList.add("hidden");
        },

        showEndMessage: function () {
            this.elements.endMessage.classList.remove("hidden");
        },

        hideEndMessage: function () {
            this.elements.endMessage.classList.add("hidden");
        },

        bindSearch: function (handler) {
            let debounceTimer;
            this.elements.searchInput.addEventListener("input", function (event) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    handler(event.target.value);
                }, 300);
            });
        }
    };

    window.PostsView = View;
})();