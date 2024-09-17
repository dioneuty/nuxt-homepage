import { hash } from 'ohash'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('html-img', {

      // 마운트 되기 전
      beforeMount(el, binding) {
        const convertImagesToNuxtImg = (el, binding) => {

            //문자열을 html 태그로 변환
            // https://velog.io/@godud2604/%EC%9D%B4%EB%AF%B8%EC%A7%80-%EC%B5%9C%EC%A0%81%ED%99%94-Lazy-Load-Intersection-Observer-API
            const html = new DOMParser().parseFromString(binding.value, 'text/html')
            debugger
            const images = html.querySelectorAll('img')

            Array.from(images).forEach((img) => {
                //img 태그에 lazy 속성 추가
                img.setAttribute('loading', 'lazy')
                img.setAttribute('format', 'webp')
                img.setAttribute('data-src', img.src)
                img.setAttribute('src', '')

                const cacheKey = hash({ dataSrc: img.dataset.src, width: img.width, height: img.height, format: img.format, loading: img.loading})
                img.setAttribute('data-cache-key', cacheKey)

                //img 태그를 nuxtImg 태그로 치환
                el.appendChild(img)
            })
        }
  
        // 초기 변환
        convertImagesToNuxtImg(el, binding)

        const modal = ref(null)

        const images = el.querySelectorAll('img')
        // 모든 이미지를 로드하지 않고 실제로 보일 때에만 이미지를 로드
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if(!entry.isIntersecting){
                    return
                }

                if (entry.isIntersecting) {
                    const img = entry.target
                    const src = img.getAttribute('data-src')
                    img.setAttribute('data-src', '')
                    img.setAttribute('src', src)
                    observer.unobserve(img)
                }
            })
        }, )

        images.forEach(img => {
            observer.observe(img)
        })
      }
    })
  })