# Blog Posts API Documentation

이 문서는 블로그 게시글 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 블로그 게시글 조회

- **Endpoint**: `GET /api/blogPosts`
- **Description**: 블로그 게시글 목록, 특정 게시글, 또는 이전/다음 게시글을 조회합니다.
- **Query Parameters**:
  - `id` (optional, number): 특정 게시글 ID.
  - `category` (optional, number): 특정 카테고리의 게시글만 조회.
  - `type` (optional, string): `navigation`으로 설정하고 `id`를 함께 제공하면 해당 글의 이전/다음 글 정보를 반환.
- **Responses**:
  - `200 OK` (단일 게시글):
    ```json
    {
      "id": "integer",
      "title": "string",
      "content": "string",
      "categoryId": "integer",
      "createdAt": "datetime",
      "category": {
        "id": "integer",
        "name": "string"
      }
    }
    ```
  - `200 OK` (게시글 목록):
    ```json
    [
      {
        "id": "integer",
        "title": "string",
        "content": "string",
        "categoryId": "integer",
        "createdAt": "datetime",
        "category": {
          "id": "integer",
          "name": "string"
        }
      }
    ]
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

## 2. 블로그 게시글 작성

- **Endpoint**: `POST /api/blogPosts`
- **Description**: 새로운 블로그 게시글을 작성합니다.
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "categoryId": "integer"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "post": { ... } // 생성된 게시글 객체
    }
    ```
  - `500 Internal Server Error`: 서버 오류.

---

## 3. 블로그 게시글 수정

- **Endpoint**: `PUT /api/blogPosts`
- **Description**: 기존 블로그 게시글을 수정합니다.
- **Request Body**:
  ```json
  {
    "id": "integer",
    "title": "string",
    "content": "string",
    "categoryId": "integer"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "post": { ... } // 수정된 게시글 객체
    }
    ```
  - `500 Internal Server Error`: 서버 오류.

---

## 4. 블로그 게시글 삭제

- **Endpoint**: `DELETE /api/blogPosts`
- **Description**: 블로그 게시글을 삭제합니다.
- **Query Parameters**:
  - `id` (required, number): 삭제할 게시글 ID.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true
    }
    ```
  - `500 Internal Server Error`: 서버 오류. 