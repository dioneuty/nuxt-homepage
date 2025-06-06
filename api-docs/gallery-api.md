# Gallery API Documentation

이 문서는 갤러리 및 관련 댓글 API 엔드포인트에 대한 명세입니다.

---

## 갤러리

### 1. 갤러리 목록 조회
- **Endpoint**: `GET /api/gallery`
- **Description**: 전체 갤러리 아이템 목록을 조회합니다. 댓글 수도 함께 반환됩니다.
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
        "createdAt": "datetime",
        "_count": {
          "comments": "integer"
        }
      }
    ]
    ```

### 2. 갤러리 상세 조회
- **Endpoint**: `GET /api/gallery?id={id}`
- **Description**: 특정 갤러리 아이템의 상세 정보를 조회합니다.
- **Query Parameters**:
  - `id` (required, number): 조회할 갤러리 아이템 ID.
- **Responses**:
  - `200 OK`: 갤러리 아이템 객체.
  - `404 Not Found`: 아이템을 찾을 수 없음.

### 3. 갤러리 항목 생성
- **Endpoint**: `POST /api/gallery`
- **Description**: 새로운 갤러리 아이템을 생성합니다.
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

### 4. 갤러리 항목 수정
- **Endpoint**: `PUT /api/gallery`
- **Description**: 기존 갤러리 아이템을 수정합니다.
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

### 5. 갤러리 항목 삭제
- **Endpoint**: `DELETE /api/gallery?id={id}`
- **Description**: 갤러리 아이템과 관련 댓글, 그리고 저장소의 파일을 모두 삭제합니다.
- **Query Parameters**:
  - `id` (required, number): 삭제할 갤러리 아이템 ID.
- **Responses**:
  - `200 OK`: `{ "success": true }`

---

## 댓글

### 1. 댓글 목록 조회
- **Endpoint**: `GET /api/gallery?id={id}&action=comments`
- **Description**: 특정 갤러리 아이템에 달린 댓글 목록을 조회합니다.
- **Query Parameters**:
  - `id` (required, number): 갤러리 아이템 ID.
  - `action` (required, string): 'comments'.
- **Responses**:
  - `200 OK`: 댓글 객체 배열.

### 2. 댓글 추가
- **Endpoint**: `POST /api/gallery?action=comment`
- **Description**: 새로운 댓글을 작성합니다.
- **Query Parameters**:
  - `action` (required, string): 'comment'.
- **Request Body**:
  ```json
  {
    "content": "string",
    "author": "string",
    "authorId": "integer",
    "galleryItemId": "integer"
  }
  ```
- **Responses**:
  - `200 OK`: 생성된 댓글 객체.

### 3. 댓글 수정
- **Endpoint**: `PUT /api/gallery?action=comment`
- **Description**: 기존 댓글을 수정합니다.
- **Query Parameters**:
  - `action` (required, string): 'comment'.
- **Request Body**:
  ```json
  {
    "id": "integer",
    "content": "string"
  }
  ```
- **Responses**:
  - `200 OK`: 수정된 댓글 객체.

### 4. 댓글 삭제
- **Endpoint**: `DELETE /api/gallery?id={id}&action=comment`
- **Description**: 댓글을 삭제합니다.
- **Query Parameters**:
  - `id` (required, number): 삭제할 댓글 ID.
  - `action` (required, string): 'comment'.
- **Responses**:
  - `200 OK`: `{ "success": true }` 