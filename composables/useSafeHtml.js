import DOMPurify from 'dompurify'

/**
 * 안전한 HTML 렌더링을 위한 composable
 * 이미지, 유튜브 영상은 허용하되 XSS 공격은 차단
 */
export function useSafeHtml() {
  
  /**
   * 이미지와 동영상을 허용하는 안전한 HTML 새니타이저
   * @param {string} html - 새니타이즈할 HTML 문자열
   * @param {object} options - 추가 옵션
   * @returns {string} 새니타이즈된 안전한 HTML
   */
  const sanitizeHtml = (html, options = {}) => {
    if (!html || typeof html !== 'string') return ''
    
    // 기본 설정: 이미지, 동영상, 기본 서식 태그 허용
    const defaultConfig = {
      ALLOWED_TAGS: [
        // 기본 서식 태그
        'p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 'strike', 'sub', 'sup',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        
        // 이미지 관련
        'img', 'figure', 'figcaption',
        
        // 동영상 관련  
        'video', 'source', 'iframe',
        
        // 링크 (필요한 경우)
        'a',
        
        // 테이블 (필요한 경우)
        'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      
      ALLOWED_ATTR: [
        // 이미지 속성
        'src', 'alt', 'width', 'height', 'class', 'style',
        
        // 동영상 속성
        'controls', 'autoplay', 'muted', 'loop', 'poster',
        
        // iframe 속성 (유튜브용)
        'frameborder', 'allowfullscreen', 'allow',
        
        // 링크 속성
        'href', 'target', 'rel',
        
        // 일반 속성
        'title', 'id'
      ],
      
      // 허용된 프로토콜만 사용
      ALLOWED_URI_REGEXP: /^(?:(?:https?|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
      
      // 스크립트 및 이벤트 핸들러 제거
      FORBID_TAGS: ['script', 'object', 'embed', 'applet', 'meta'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
      
      // 사용자 정의 옵션 병합
      ...options
    }
    
    return DOMPurify.sanitize(html, defaultConfig)
  }
  
  /**
   * 갤러리용 이미지 새니타이저 (더 엄격한 설정)
   * @param {string} html - Base64 이미지가 포함된 HTML
   * @returns {string} 새니타이즈된 HTML
   */
  const sanitizeGalleryHtml = (html) => {
    return sanitizeHtml(html, {
      ALLOWED_TAGS: ['img', 'div', 'p', 'br'],
      ALLOWED_ATTR: ['src', 'alt', 'class', 'style', 'width', 'height'],
      ALLOW_DATA_ATTR: false
    })
  }
  
  /**
   * 블로그/게시판용 리치 콘텐츠 새니타이저
   * @param {string} html - 리치 에디터에서 생성된 HTML
   * @returns {string} 새니타이즈된 HTML
   */
  const sanitizeRichContent = (html) => {
    return sanitizeHtml(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'u', 'strike', 'sub', 'sup',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
        'img', 'video', 'iframe', 'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td'
      ],
      ALLOWED_ATTR: [
        'src', 'alt', 'width', 'height', 'class', 'style',
        'href', 'target', 'rel', 'title', 'controls', 'autoplay', 'muted',
        'frameborder', 'allowfullscreen', 'allow'
      ]
    })
  }
  
  /**
   * 유튜브 iframe만 허용하는 새니타이저
   * @param {string} html - 유튜브 embed HTML
   * @returns {string} 새니타이즈된 HTML
   */
  const sanitizeYouTubeEmbed = (html) => {
    return sanitizeHtml(html, {
      ALLOWED_TAGS: ['iframe', 'div'],
      ALLOWED_ATTR: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'class', 'allow'],
      ALLOWED_URI_REGEXP: /^https:\/\/(www\.)?youtube(-nocookie)?\.com\//
    })
  }
  
  /**
   * 일반 텍스트에서 XSS 위험 요소만 제거 (기본 서식 유지)
   * @param {string} html - 기본 HTML 텍스트
   * @returns {string} 새니타이즈된 HTML
   */
  const sanitizeBasicHtml = (html) => {
    return sanitizeHtml(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
      ALLOWED_ATTR: ['class']
    })
  }
  
  /**
   * 마크다운 렌더링 결과 새니타이저 (AI 챗용)
   * @param {string} html - 마크다운에서 변환된 HTML
   * @returns {string} 새니타이즈된 HTML
   */
  const sanitizeMarkdown = (html) => {
    return sanitizeHtml(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'strong', 'b', 'em', 'i', 'code', 'pre', 'blockquote',
        'ul', 'ol', 'li', 'a', 'img'
      ],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'target', 'rel']
    })
  }
  
  return {
    sanitizeHtml,
    sanitizeGalleryHtml,
    sanitizeRichContent,
    sanitizeYouTubeEmbed,
    sanitizeBasicHtml,
    sanitizeMarkdown
  }
}