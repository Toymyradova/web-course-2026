        loadNextPage: async function () {
            if (this.model.isLoading || !this.model.hasMorePosts) return;

            this.view.showLoader(true);
            this.view.hideError();

            const result = await this.model.fetchPosts();

            this.view.showLoader(false);

            if (result && result.success) {
                this.view.renderPosts(this.model.filteredPosts);
                
                // Если данные локальные (нет интернета) - покажем сообщение, но не красное
                if (result.isFallback) {
                    this.view.showError("Нет подключения к интернету. Показаны локальные данные.");
                    this.view.elements.errorMessage.style.background = "#fefcbf";
                    this.view.elements.errorMessage.style.color = "#744210";
                } 
                // Если посты закончились
                else if (!this.model.hasMorePosts) {
                    this.view.showEndMessage();
                }
            } else if (result) {
                this.view.showError(`Не удалось загрузить посты: ${result.error}`);
            }
        }