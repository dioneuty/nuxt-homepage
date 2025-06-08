# Q&A API Documentation

이 문서는 Q&A 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. Q&A 조회

- **Endpoint**: `GET /api/qna`
- **Description**: Q&A 목록을 조회하거나 특정 Q&A를 조회합니다.
- **Query Parameters**:
  - `id` (optional, number): 특정 Q&A ID.
  - `page` (optional, number, default: 1): 목록 조회 시 페이지 번호.
  - `itemsPerPage` (optional, number, default: 10): 페이지 당 항목 수.
  - `type` (optional, string): 검색 필드 (`author`, `title`, `content`). `type`이 없으면 모든 필드에서 검색.
  - `text` (optional, string): 검색어.
- **Responses**:
  - `200 OK` (단일 Q&A): Q&A 객체.
  - `200 OK` (Q&A 목록):
    ```json
    {
      "qnas": [],
      "total": "integer",
      "page": "integer",
      "itemsPerPage": "integer"
    }
    ```
  - `404 Not Found`: Q&A를 찾을 수 없음.

---

## 2. 질문 작성

- **Endpoint**: `POST /api/qna`
- **Description**: 새로운 질문을 작성합니다.
- **Request Body**:
  ```json
  {
    "questionTitle": "string",
    "questionContent": "string",
    "author": "string"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true, "id": "integer" }`.
  - `500 Internal Server Error`: 서버 오류.

---

## 3. 질문 수정 / 답변 작성

- **Endpoint**: `PUT /api/qna`
- **Description**: 기존 질문을 수정하거나 답변을 추가/수정합니다.
- **Request Body**:
  ```json
  {
    "id": "integer",
    "questionTitle": "string", // (optional)
    "questionContent": "string", // (optional)
    "answerContent": "string", // (optional)
    "answerer": "string" // (optional)
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true }`.
  - `500 Internal Server Error`: 서버 오류.

---

## 4. Q&A 삭제

- **Endpoint**: `DELETE /api/qna`
- **Description**: Q&A를 삭제합니다.
- **Request Body**:
  ```json
  {
    "id": "integer"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true }`.
  - `500 Internal Server Error`: 서버 오류. 