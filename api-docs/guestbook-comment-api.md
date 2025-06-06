# Guestbook Comment API Documentation

이 문서는 방명록 댓글 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 댓글 작성

- **Endpoint**: `POST /api/guestbook/comment`
- **Description**: 새로운 방명록 댓글을 작성합니다.
- **Request Body**:
  ```json
  {
    "guestbookId": "integer",
    "content": "string",
    "author": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 생성된 댓글 객체.
  - `500 Internal Server Error`: 서버 오류.

---

## 2. 댓글 수정

- **Endpoint**: `PUT /api/guestbook/comment?id={id}`
- **Description**: 기존 방명록 댓글을 수정합니다.
- **Query Parameters**:
  - `id` (required, number): 수정할 댓글 ID.
- **Request Body**:
  ```json
  {
    "content": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 수정된 댓글 객체.
  - `401 Unauthorized`: 비밀번호 불일치.
  - `404 Not Found`: 댓글을 찾을 수 없음.
  - `500 Internal Server Error`: 서버 오류.

---

## 3. 댓글 삭제

- **Endpoint**: `DELETE /api/guestbook/comment?id={id}`
- **Description**: 방명록 댓글을 삭제합니다.
- **Query Parameters**:
  - `id` (required, number): 삭제할 댓글 ID.
- **Request Body**:
  ```json
  {
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true }`.
  - `401 Unauthorized`: 비밀번호 불일치.
  - `404 Not Found`: 댓글을 찾을 수 없음.
  - `500 Internal Server Error`: 서버 오류. 