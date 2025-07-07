/**
 * 테마 설정 데이터를 가져오는 컴포저블 함수입니다.
 * 여러 레이아웃과 컴포넌트에서 중복되는 테마 설정 API 호출을 통합하여
 * 캐싱을 통한 성능 최적화와 코드 중복 제거를 제공합니다.
 * 
 * @returns {Object} 테마 설정 데이터와 관련 상태
 * @property {ComputedRef<object>} data - 테마 설정 데이터 객체
 * @property {ComputedRef<boolean>} pending - 데이터 로딩 중 여부
 * @property {ComputedRef<Error|null>} error - 에러 상태
 * @property {function(): Promise<void>} refresh - 데이터 새로고침 함수
 */
export function useThemeSettings() {
  return useFetch('/api/theme-settings', {
    key: 'theme-settings',
    default: () => ({
      lightHeaderColor: '#FFFFFF',
      darkHeaderColor: '#1A202C',
      lightFooterColor: '#F7FAFC',
      darkFooterColor: '#1A202C',
      lightBackgroundColor: '#FFFFFF',
      darkBackgroundColor: '#1A202C',
      siteTitle: 'My Website',
      siteLogoUrl: '/images/logo.png',
      siteLogoIcon: null,
      showSiteTitle: true,
      showSiteLogoUrl: false,
      showSiteLogoIcon: false,
    }),
    transform: (data) => ({
      lightHeaderColor: data?.lightHeaderColor || '#FFFFFF',
      darkHeaderColor: data?.darkHeaderColor || '#1A202C',
      lightFooterColor: data?.lightFooterColor || '#F7FAFC',
      darkFooterColor: data?.darkFooterColor || '#1A202C',
      lightBackgroundColor: data?.lightBackgroundColor || '#FFFFFF',
      darkBackgroundColor: data?.darkBackgroundColor || '#1A202C',
      siteTitle: data?.siteTitle || 'My Website',
      siteLogoUrl: data?.siteLogoUrl || '/images/logo.png',
      siteLogoIcon: data?.siteLogoIcon || null,
      showSiteTitle: data?.showSiteTitle ?? true,
      showSiteLogoUrl: data?.showSiteLogoUrl ?? false,
      showSiteLogoIcon: data?.showSiteLogoIcon ?? false,
    }),
    server: true
  })
} 