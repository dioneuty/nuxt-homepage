# Wiki API Documentation

이 문서는 위키 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 위키 페이지 조회

- **Endpoint**: `GET /api/wiki`
- **Description**: 위키 페이지 목록 전체 또는 특정 ID의 페이지를 조회합니다. 이 엔드포인트는 인증이 필요하지 않습니다.
- **Query Parameters**:
  - `id` (optional, number): 특정 위키 페이지의 ID. 제공되지 않으면 전체 목록을 반환합니다.
- **Responses**:
  - `200 OK` (단일 페이지): 위키 페이지 객체.
  - `200 OK` (페이지 목록): 위키 페이지 객체의 배열.
    ```json
    {
      "id": "integer",
      "title": "string",
      "content": "string",
      "createdAt": "datetime",
      "updatedAt": "datetime"
    }
    ```
  - `400 Bad Request`: ID가 유효하지 않은 경우.
  - `404 Not Found`: 페이지를 찾을 수 없는 경우.

---

## 2. 새 위키 페이지 생성 (인증 필요)

- **Endpoint**: `POST /api/wiki`
- **Description**: 새로운 위키 페이지를 생성합니다. 요청 시 유효한 `auth_token` 쿠키가 필요합니다.
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 생성된 위키 페이지 객체.
  - `401 Unauthorized`: 인증 토큰이 없거나 유효하지 않은 경우.
  - `500 Internal Server Error`: 서버 오류.

---

## 3. 위키 페이지 수정 (인증 필요)

- **Endpoint**: `PUT /api/wiki?id={id}`
- **Description**: 기존 위키 페이지를 수정합니다. 요청 시 유효한 `auth_token` 쿠키가 필요합니다.
- **Query Parameters**:
  - `id` (required, number): 수정할 위키 페이지의 ID.
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 수정된 위키 페이지 객체.
  - `401 Unauthorized`: 인증 토큰이 없거나 유효하지 않은 경우.

---

## 4. 위키 페이지 삭제 (인증 필요)

- **Endpoint**: `DELETE /api/wiki?id={id}`
- **Description**: 위키 페이지를 삭제합니다. 요청 시 유효한 `auth_token` 쿠키가 필요합니다.
- **Query Parameters**:
  - `id` (required, number): 삭제할 위키 페이지의 ID.
- **Responses**:
  - `200 OK`: 삭제된 위키 페이지 객체.
  - `401 Unauthorized`: 인증 토큰이 없거나 유효하지 않은 경우. 