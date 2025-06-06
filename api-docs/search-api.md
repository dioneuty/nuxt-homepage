# Search API Documentation

이 문서는 통합 검색 API 엔드포인트에 대한 명세입니다.

---

## 1. 통합 검색

- **Endpoint**: `POST /api/search`
- **Description**: 사용자가 입력한 검색어로 여러 데이터 소스(게시판, 블로그, 위키, 갤러리, Q&A, 유머게시판)를 한 번에 검색합니다.
- **Request Body**:
  ```json
  {
    "query": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 검색 결과 객체의 배열.
    ```json
    [
      {
        "id": "integer",
        "title": "string",
        "excerpt": "string", // 내용의 일부 (100자)
        "type": "string", // '게시판', '블로그' 등 한국어 타입
        "link": "string", // 해당 컨텐츠로 이동할 수 있는 URL
        "tags": ["string"] // (갤러리 경우) 태그 배열
      }
    ]
    ```
  - `500 Internal Server Error`: 서버 오류. 