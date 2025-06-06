# Images API Documentation

이 문서는 이미지 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 이미지 목록 조회

- **Endpoint**: `GET /api/images`
- **Description**: 저장된 모든 이미지의 목록을 조회합니다.
- **Responses**:
  - `200 OK`: 이미지 객체 배열.
    ```json
    [
      {
        "id": "integer",
        "url": "string",
        "alt": "string",
        "createdAt": "datetime"
      }
    ]
    ```
  - `500 Internal Server Error`: 서버 오류.

---

## 2. 이미지 추가

- **Endpoint**: `POST /api/images`
- **Description**: 새로운 이미지를 데이터베이스에 추가합니다. (파일 업로드 자체는 다른 로직으로 처리되어야 합니다.)
- **Request Body**:
  ```json
  {
    "url": "string",
    "alt": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 생성된 이미지 객체.
  - `500 Internal Server Error`: 서버 오류.

---

## 3. 이미지 삭제

- **Endpoint**: `DELETE /api/images`
- **Description**: 데이터베이스에서 이미지 정보를 삭제합니다.
- **Request Body**:
  ```json
  {
    "id": "integer"
  }
  ```
- **Responses**:
  - `200 OK`: `{ "success": true }`.
  - `500 Internal Server Error`: 서버 오류. 