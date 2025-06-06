# Board Posts API Documentation

이 문서는 게시판 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 게시글 조회

- **Endpoint**: `GET /api/boardPosts`
- **Description**: 게시글 목록을 조회하거나 특정 게시글, 또는 이전/다음 게시글을 조회합니다.
- **Query Parameters**:
  - `id` (optional, number): 특정 게시글 ID.
  - `type` (optional, string):
    - `navigation`: `id`와 함께 사용하여 이전/다음 게시글 정보를 가져옵니다.
    - `author`, `title`, `content`: `text`와 함께 사용하여 특정 필드를 기준으로 검색합니다.
  - `page` (optional, number, default: 1): 목록 조회 시 페이지 번호.
  - `itemsPerPage` (optional, number, default: 10): 페이지 당 항목 수.
  - `text` (optional, string): 검색어.
  - `sortColumn` (optional, string): 정렬할 필드 이름.
  - `sortOrder` (optional, string, 'asc' or 'desc'): 정렬 순서.
- **Responses**:
  - `200 OK` (단일 게시글):
    ```json
    {
      "id": "integer",
      "title": "string",
      "content": "string",
      "author": "string",
      "createdAt": "datetime"
    }
    ```
  - `200 OK` (게시글 목록):
    ```json
    {
      "posts": [],
      "total": "integer",
      "page": "integer",
      "itemsPerPage": "integer"
    }
    ```
  - `200 OK` (이전/다음 게시글):
     ```json
    {
      "prev": { "id": "integer", "title": "string" },
      "next": { "id": "integer", "title": "string" }
    }
    ```
  - `404 Not Found`: 게시글을 찾을 수 없음.
  - `500 Internal Server Error`: 서버 오류.

---

## 2. 게시글 작성

- **Endpoint**: `POST /api/boardPosts`
- **Description**: 새로운 게시글을 작성합니다.
- **Request Body**:
  ```json
  {
    "title": "string",
    "author": "string",
    "content": "string"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "id": "integer"
    }
    ```
  - `500 Internal Server Error`: 서버 오류.

---

## 3. 게시글 수정

- **Endpoint**: `PUT /api/boardPosts`
- **Description**: 기존 게시글을 수정합니다.
- **Request Body**:
  ```json
  {
    "id": "integer",
    "title": "string",
    "author": "string",
    "content": "string"
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

---

## 4. 게시글 삭제

- **Endpoint**: `DELETE /api/boardPosts`
- **Description**: 게시글을 삭제합니다.
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