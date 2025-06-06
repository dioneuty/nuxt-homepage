# Categories API Documentation

이 문서는 블로그 카테고리 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 카테고리 목록 조회

- **Endpoint**: `GET /api/categories`
- **Description**: 모든 카테고리 목록을 각 카테고리에 속한 게시글 수와 함께 조회합니다. "전체" 카테고리를 포함하여 반환합니다.
- **Responses**:
  - `200 OK`: 카테고리 객체 배열
    ```json
    [
      {
        "id": "all",
        "name": "전체",
        "post_count": "integer"
      },
      {
        "id": "integer",
        "name": "string",
        "slug": "string",
        "post_count": "integer"
      }
    ]
    ```
  - `500 Internal Server Error`: 서버 오류.

---

## 2. 카테고리 일괄 업데이트

- **Endpoint**: `PUT /api/categories`
- **Description**: 카테고리를 생성, 수정 및 삭제합니다. 삭제된 카테고리에 속한 게시글은 '기본 카테고리'로 이동됩니다.
- **Request Body**:
  ```json
  {
    "categories": [
      {
        "id": "integer", // (optional) ID가 있으면 수정, 없으면 생성
        "name": "string",
        "slug": "string" // (optional)
      }
    ],
    "deletedCategories": [ "integer" ] // 삭제할 카테고리 ID 배열
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true
    }
    ```
  - `500 Internal Server Error`: 서버 오류. 