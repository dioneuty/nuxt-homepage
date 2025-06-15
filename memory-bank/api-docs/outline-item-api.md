# Outline Item API Documentation

이 문서는 아웃라인 아이템 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 아웃라인 아이템 생성

- **Endpoint**: `POST /api/outline-item`
- **Description**: 새로운 아웃라인 아이템을 생성합니다.
- **Request Body**:
  ```json
  {
    "id": "integer",
    "content": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 생성된 아웃라인 아이템 객체.

---

## 2. 아웃라인 아이템 조회

- **Endpoint**: `GET /api/outline-item/{id}`
- **Description**: 특정 ID의 아웃라인 아이템을 조회합니다.
- **URL Parameters**:
  - `id` (required, bigint): 조회할 아이템의 ID.
- **Responses**:
  - `200 OK`: 조회된 아웃라인 아이템 객체.
    ```json
    {
      "id": "string", // BigInt는 문자열로 변환되어 반환됨
      "content": "string",
      "order": "integer",
      "parentId": "string" // BigInt는 문자열로 변환되어 반환됨
    }
    ```
  - `404 Not Found`: 아이템을 찾을 수 없음.

---

## 3. 아웃라인 아이템 수정/생성 (Upsert)

- **Endpoint**: `PUT /api/outline-item/{id}`
- **Description**: 특정 ID의 아웃라인 아이템을 수정합니다. 만약 아이템이 존재하지 않으면 새로 생성합니다.
- **URL Parameters**:
  - `id` (required, bigint): 수정 또는 생성할 아이템의 ID.
- **Request Body**:
  ```json
  {
    "content": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 수정 또는 생성된 아웃라인 아이템 객체. 