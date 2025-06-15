# File Upload API Documentation

이 문서는 파일 업로드 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 파일 업로드

- **Endpoint**: `POST /api/upload`
- **Description**: 단일 파일을 서버에 업로드합니다. 업로드된 파일은 `/public/uploads` 디렉토리에 저장됩니다.
- **Request Body**:
  - `Content-Type`: `multipart/form-data`
  - Body에는 업로드할 파일 데이터가 포함되어야 합니다.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "url": "/uploads/1678886400000-example.jpg" // 서버에 저장된 파일의 접근 URL
    }
    ```
  - `400 Bad Request`: 업로드된 파일이 없을 경우.
  - `405 Method Not Allowed`: POST 요청이 아닐 경우.
  - `500 Internal Server Error`: 서버에서 파일 저장 중 오류 발생 시. 