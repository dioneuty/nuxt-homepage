# Holidays API Documentation

이 문서는 공휴일 정보 조회 API 엔드포인트에 대한 명세입니다.

---

## 1. 특정 월의 공휴일 조회

- **Endpoint**: `GET /api/holidays`
- **Description**: 지정된 연도와 월에 해당하는 공휴일 목록을 조회합니다.
- **Query Parameters**:
  - `year` (required, number): 조회할 연도.
  - `month` (required, number): 조회할 월.
- **Responses**:
  - `200 OK`: 공휴일 객체 배열.
    ```json
    [
      {
        "id": "integer",
        "name": "string",
        "date": "string", // YYYY-MM-DD
        "year": "integer",
        "month": "integer",
        "day": "integer"
      }
    ]
    ``` 