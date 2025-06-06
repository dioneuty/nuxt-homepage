# User API Documentation

이 문서는 사용자 관련 API 엔드포인트에 대한 명세입니다.

---

## 1. 로그인

- **Endpoint**: `POST /api/user?type=login`
- **Description**: 사용자가 시스템에 로그인합니다.
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "로그인 성공",
      "user": {
        "id": "integer",
        "username": "string",
        "role": "string"
      }
    }
    ```
  - `400 Bad Request`: 요청 형식이 잘못된 경우
  - `401 Unauthorized`: 인증에 실패한 경우

---

## 2. 로그아웃

- **Endpoint**: `POST /api/user?type=logout`
- **Description**: 사용자가 시스템에서 로그아웃합니다.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "로그아웃 성공"
    }
    ```

---

## 3. 로그인 상태 확인

- **Endpoint**: `GET /api/user?type=check`
- **Description**: 현재 로그인 상태를 확인합니다.
- **Responses**:
  - `200 OK`:
    ```json
    {
      "isLoggedIn": "boolean",
      "user": {
        "id": "integer",
        "username": "string",
        "role": "string",
        "email": "string"
      }
    }
    ```

---

## 4. 회원가입

- **Endpoint**: `POST /api/user?type=register`
- **Description**: 새로운 사용자를 등록합니다.
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "회원가입 성공",
      "user": {
        "id": "integer",
        "username": "string",
        "role": "string"
      }
    }
    ```
  - `400 Bad Request`: 요청 형식이 잘못된 경우
  - `500 Internal Server Error`: 서버 오류

---

## 5. 사용자 정보 수정

- **Endpoint**: `PUT /api/user?type=update`
- **Description**: 현재 로그인된 사용자의 정보를 수정합니다.
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "success": "boolean",
      "user": {
        "id": "integer",
        "username": "string",
        "email": "string",
        "role": "string"
      }
    }
    ```
  - `401 Unauthorized`: 인증되지 않은 사용자인 경우
  - `500 Internal Server Error`: 서버 오류 