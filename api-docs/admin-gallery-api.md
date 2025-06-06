# Admin Gallery API Documentation

이 문서는 관리자 갤러리 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 관리자 갤러리 목록 조회

- **Endpoint**: `GET /api/admingallery`
- **Description**: 전체 관리자 갤러리 아이템 목록을 조회합니다.
- **Responses**:
  - `200 OK`: 갤러리 아이템 배열
    ```json
    [
      {
        "id": "integer",
        "title": "string",
        "content": "string",
        "description": "string",
        "tags": "string",
        "createdAt": "datetime"
      }
    ]
    ```

---

## 2. 관리자 갤러리 상세 조회

- **Endpoint**: `GET /api/admingallery?id={id}`
- **Description**: 특정 관리자 갤러리 아이템의 상세 정보를 조회합니다.
- **Query Parameters**:
  - `id` (required, number): 조회할 갤러리 아이템 ID.
- **Responses**:
  - `200 OK`: 갤러리 아이템 객체.
  - `404 Not Found`: 아이템을 찾을 수 없음.

---

## 3. 관리자 갤러리 항목 생성

- **Endpoint**: `POST /api/admingallery`
- **Description**: 새로운 관리자 갤러리 아이템을 생성합니다.
- **Request Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "description": "string",
    "tags": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 생성된 갤러리 아이템 객체.

---

## 4. 관리자 갤러리 항목 수정

- **Endpoint**: `PUT /api/admingallery`
- **Description**: 기존 관리자 갤러리 아이템을 수정합니다.
- **Request Body**:
  ```json
  {
    "id": "integer",
    "title": "string",
    "content": "string",
    "description": "string",
    "tags": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 수정된 갤러리 아이템 객체.

---

## 5. 관리자 갤러리 항목 삭제

- **Endpoint**: `DELETE /api/admingallery?id={id}`
- **Description**: 관리자 갤러리 아이템과 저장소의 파일을 모두 삭제합니다.
- **Query Parameters**:
  - `id` (required, number): 삭제할 갤러리 아이템 ID.
- **Responses**:
  - `200 OK`: `{ "success": true }` 