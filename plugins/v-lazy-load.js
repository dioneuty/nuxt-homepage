export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('lazy-load', {
        
        beforeMount(el, binding) {
            if (process.client) {
                function loadComponent() {
                    if (binding.value) {
                        binding.value();
                    }
                }

                function handleIntersect(entries, observer) {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            loadComponent();
                            observer.unobserve(el);
                        }
                    });
                }

                const observer = new IntersectionObserver(handleIntersect);
                observer.observe(el);
            }
        }
    })
});