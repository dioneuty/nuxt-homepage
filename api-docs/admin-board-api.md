# Admin Board API Documentation

이 문서는 관리자 게시판 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 관리자 게시글 조회

- **Endpoint**: `GET /api/adminboard`
- **Description**: 관리자 게시글 목록을 조회하거나 특정 게시글을 조회합니다.
- **Query Parameters**:
  - `id` (optional, number): 특정 게시글 ID.
  - `page` (optional, number, default: 1): 목록 조회 시 페이지 번호.
  - `limit` (optional, number, default: 10): 페이지 당 항목 수.
  - `searchType` (optional, string): 검색할 필드 (`author`, `title`, `content`).
  - `searchText` (optional, string): 검색어.
  - `sortColumn` (optional, string): 정렬할 필드 이름.
  - `sortOrder` (optional, string, 'asc' or 'desc'): 정렬 순서.
- **Responses**:
  - `200 OK` (단일 게시글):
    ```json
    {
      "id": "integer",
      "title": "string",
      "content": "string",
      "createdAt": "datetime"
    }
    ```
  - `200 OK` (게시글 목록):
    ```json
    {
      "posts": [],
      "total": "integer",
      "page": "integer",
      "limit": "integer"
    }
    ```
  - `404 Not Found`: 게시글을 찾을 수 없음.
  - `500 Internal Server Error`: 서버 오류.

---

## 2. 관리자 게시글 작성

- **Endpoint**: `POST /api/adminboard`
- **Description**: 새로운 관리자 게시글을 작성합니다.
- **Request Body**:
  ```json
  {
    "title": "string",
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

## 3. 관리자 게시글 수정

- **Endpoint**: `PUT /api/adminboard`
- **Description**: 기존 관리자 게시글을 수정합니다.
- **Request Body**:
  ```json
  {
    "id": "integer",
    "title": "string",
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

## 4. 관리자 게시글 삭제

- **Endpoint**: `DELETE /api/adminboard`
- **Description**: 관리자 게시글을 삭제합니다.
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