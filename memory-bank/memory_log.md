## API 오류 처리 헬퍼 함수 통합 (handleApiError)

### 내용
반복되는 오류 처리 로직을 `server/utils/apiErrorHandlers.js` 파일에 정의된 `handleApiError` 공통 함수로 통합했습니다. 이 작업은 `server/api` 및 그 하위 디렉토리 내의 모든 관련 API 파일에 적용되었습니다. 기존의 `createError` 호출과 `console.error` 로깅은 `handleApiError(event, statusCode, message, error)` 호출로 대체되어 일관된 오류 로깅 및 응답을 제공합니다.

### 적용된 파일 목록
*   `server/utils/apiErrorHandlers.js`
*   `server/api/adminboard.js`
*   `server/api/admingallery.js`
*   `server/api/holidays.js`
*   `server/api/images.js`
*   `server/api/upload.js`
*   `server/api/wiki.js`
*   `server/api/menus/index.js`
*   `server/api/menus/[id].js`
*   `server/api/outline-item/index.js`
*   `server/api/outline-item/[id].js`
*   `server/api/admin/users.get.js`
*   `server/api/admin/users.post.js`
*   `server/api/admin/db/models.get.js`
*   `server/api/admin/db/[model]/index.get.js`
*   `server/api/admin/db/[model]/index.post.js`
*   `server/api/admin/db/[model]/[id].get.js`
*   `server/api/admin/db/[model]/[id].put.js`
*   `server/api/admin/db/[model]/[id].delete.js`
*   `server/api/admin/users/[id].put.js`
*   `server/api/admin/users/[id].delete.js`
*   `server/api/admin/users/[id]/reset-password.post.js`
*   `server/api/admin/users/[id]/toggle-status.post.js` 