# Guestbook API Documentation

이 문서는 방명록 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 방명록 목록 조회

- **Endpoint**: `GET /api/guestbook`
- **Description**: 방명록 게시글 목록을 페이지네이션과 함께 조회합니다.
- **Query Parameters**:
  - `page` (optional, number, default: 1): 조회할 페이지 번호
  - `limit` (optional, number, default: 10): 페이지 당 게시글 수
- **Responses**:
  - `200 OK`:
    ```json
    {
      "posts": [
        {
          "id": "integer",
          "title": "string",
          "content": "string",
          "author": "string",
          "createdAt": "datetime",
          "comments": []
        }
      ],
      "totalCount": "integer",
      "totalPages": "integer"
    }
    ```
  - `500 Internal Server Error`: 서버 오류

---

## 2. 방명록 작성

- **Endpoint**: `POST /api/guestbook`
- **Description**: 새로운 방명록 게시글을 작성합니다.
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "author": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 생성된 게시글 객체
    ```json
    {
      "id": "integer",
      "title": "string",
      "content": "string",
      "author": "string",
      "createdAt": "datetime"
    }
    ```
  - `500 Internal Server Error`: 서버 오류

---

## 3. 방명록 수정

- **Endpoint**: `PUT /api/guestbook`
- **Description**: 기존 방명록 게시글을 수정합니다.
- **Query Parameters**:
  - `id` (required, number): 수정할 게시글 ID
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 수정된 게시글 객체
  - `401 Unauthorized`: 비밀번호 불일치
  - `404 Not Found`: 게시글을 찾을 수 없음
  - `500 Internal Server Error`: 서버 오류

---

## 4. 방명록 삭제

- **Endpoint**: `DELETE /api/guestbook`
- **Description**: 방명록 게시글을 삭제합니다.
- **Query Parameters**:
  - `id` (required, number): 삭제할 게시글 ID
- **Request Body**:
  ```json
  {
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true
    }
    ```
  - `401 Unauthorized`: 비밀번호 불일치
  - `404 Not Found`: 게시글을 찾을 수 없음
  - `500 Internal Server Error`: 서버 오류 