# Humor Posts API Documentation

이 문서는 유머 게시판 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 유머 게시글 조회

- **Endpoint**: `GET /api/humorPosts`
- **Description**: 유머 게시글 목록을 조회하거나 특정 게시글을 조회합니다.
- **Query Parameters**:
  - `id` (optional, number): 특정 게시글 ID.
  - `page` (optional, number, default: 1): 목록 조회 시 페이지 번호.
  - `limit` (optional, number, default: 10): 페이지 당 항목 수.
- **Responses**:
  - `200 OK` (단일 게시글): 게시글 객체.
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

---

## 2. 유머 게시글 작성

- **Endpoint**: `POST /api/humorPosts`
- **Description**: 새로운 유머 게시글을 작성합니다.
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "author": "string"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true, "id": "integer" }`
  - `500 Internal Server Error`: 서버 오류.

---

## 3. 게시글 좋아요

- **Endpoint**: `PUT /api/humorPosts`
- **Description**: 특정 게시글의 '좋아요' 수를 1 증가시킵니다.
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
      "success": true,
      "likes": "integer" // 업데이트된 좋아요 수
    }
    ```
  - `500 Internal Server Error`: 서버 오류.

---

## 4. 유머 게시글 삭제

- **Endpoint**: `DELETE /api/humorPosts`
- **Description**: 유머 게시글을 삭제합니다.
- **Request Body**:
  ```json
  {
    "id": "integer"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true }`
  - `500 Internal Server Error`: 서버 오류. 