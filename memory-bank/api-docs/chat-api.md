# Chat API Documentation

이 문서는 채팅 관련 API 엔드포인트에 대한 명세입니다. 모든 요청은 `POST /api/chat`으로 보내며, `action` 필드에 따라 다른 작업을 수행합니다.

---

## 1. 채팅 메시지 전송 및 응답 받기

- **Action**: `chat`
- **Description**: 사용자 메시지를 받아 OpenAI API로 전송하고, AI의 응답을 받아 대화 내역을 저장 또는 업데이트합니다.
- **Request Body**:
  ```json
  {
    "action": "chat",
    "message": "string",
    "screenId": "string" // 클라이언트에서 생성한 고유 ID
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "string", // AI 응답 메시지
      "model": "string",
      "created": "timestamp",
      "chatId": "integer",
      "screenId": "string"
    }
    ```
  - `200 OK` (오류):
    ```json
    {
      "success": false,
      "error": "string"
    }
    ```

---

## 2. 전체 채팅 내역 로드

- **Action**: `load`
- **Description**: 저장된 모든 채팅의 목록을 불러옵니다.
- **Request Body**:
  ```json
  {
    "action": "load"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "chats": [
        {
          "id": "integer",
          "screenId": "string",
          "title": "string",
          "messages": "string", // JSON 문자열
          "createdAt": "datetime",
          "updatedAt": "datetime"
        }
      ]
    }
    ```
  - `200 OK` (오류):
    ```json
    {
      "success": false,
      "error": "string"
    }
    ```

---

## 3. 채팅 저장

- **Action**: `save`
- **Description**: 특정 채팅 세션의 제목과 전체 대화 내용을 저장(upsert)합니다.
- **Request Body**:
  ```json
  {
    "action": "save",
    "screenId": "string",
    "title": "string",
    "messages": "string" // JSON 형태의 대화 배열을 문자열화
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "채팅이 성공적으로 저장되었습니다.",
      "chat": { ... } // 저장된 채팅 객체
    }
    ```
  - `200 OK` (오류):
    ```json
    {
      "success": false,
      "error": "string"
    }
    ```

---

## 4. 채팅 삭제

- **Action**: `delete`
- **Description**: 특정 채팅 세션을 삭제합니다.
- **Request Body**:
  ```json
  {
    "action": "delete",
    "screenId": "string"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": true,
      "message": "채팅이 성공적으로 삭제되었습니다."
    }
    ```
  - `200 OK` (오류):
    ```json
    {
      "success": false,
      "error": "string"
    }
    ``` 