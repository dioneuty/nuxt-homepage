# Contact API Documentation

이 문서는 문의하기(Contact) 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 문의 조회

- **Endpoint**: `GET /api/contact`
- **Description**: 문의 목록을 검색, 정렬, 페이지네이션과 함께 조회하거나 특정 문의를 조회합니다.
- **Query Parameters**:
  - `id` (optional, number): 특정 문의 ID.
  - `page` (optional, number, default: 1): 목록 조회 시 페이지 번호.
  - `itemsPerPage` (optional, number, default: 10): 페이지 당 항목 수.
  - `type` (optional, string): 검색 필드 (`author`, `title`, `content`).
  - `text` (optional, string): 검색어.
  - `sortColumn` (optional, string): 정렬할 필드 이름.
  - `sortOrder` (optional, string, 'asc' or 'desc'): 정렬 순서.
- **Responses**:
  - `200 OK` (단일 문의): 문의 객체.
  - `200 OK` (문의 목록):
    ```json
    {
      "posts": [],
      "total": "integer",
      "page": "integer",
      "itemsPerPage": "integer"
    }
    ```
  - `404 Not Found`: 문의를 찾을 수 없음.
  - `500 Internal Server Error`: 서버 오류.

---

## 2. 문의/답변 작성

- **Endpoint**: `POST /api/contact`
- **Description**: 새로운 문의 또는 기존 문의에 대한 답변을 작성합니다.
- **Request Body (새 문의)**:
  ```json
  {
    "author": "string",
    "title": "string",
    "content": "string",
    "email": "string"
  }
  ```
- **Request Body (답변)**:
  ```json
  {
    "type": "reply",
    "id": "integer", // 원본 문의 ID
    "content": "string"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "id": "integer" // 생성된 문의/답변의 ID
    }
    ```
  - `404 Not Found`: (답변 작성 시) 원본 문의를 찾을 수 없음.
  - `500 Internal Server Error`: 서버 오류.

---

## 3. 문의 삭제

- **Endpoint**: `DELETE /api/contact`
- **Description**: 문의를 삭제합니다.
- **Request Body**:
  ```json
  {
    "id": "integer"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true
    }
    ```
  - `500 Internal Server Error`: 서버 오류. 