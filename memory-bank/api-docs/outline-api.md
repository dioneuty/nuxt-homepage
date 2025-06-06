# Outline API Documentation

이 문서는 아웃라인 상태 저장 및 조회 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 최신 아웃라인 상태 조회

- **Endpoint**: `GET /api/outline`
- **Description**: 데이터베이스에 저장된 가장 최신 아웃라인 상태를 조회합니다.
- **Responses**:
  - `200 OK`: 아웃라인 상태 객체. 저장된 상태가 없으면 `null`을 반환합니다.
    ```json
    {
      // 아웃라인 상태를 나타내는 JSON 객체
    }
    ```

---

## 2. 아웃라인 상태 저장

- **Endpoint**: `POST /api/outline`
- **Description**: 현재 아웃라인 상태를 데이터베이스에 새로 저장합니다.
- **Request Body**:
  - 아웃라인의 현재 상태를 나타내는 JSON 객체. 형식은 자유롭습니다.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true
    }
    ``` 