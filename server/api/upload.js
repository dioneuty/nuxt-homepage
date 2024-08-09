/**
 * 이 핸들러 함수는 파일 업로드 관련 API 요청을 처리합니다.
 * 
 * @param {object} event - H3 이벤트 객체로, 요청 및 응답에 대한 정보를 포함합니다.
 * 
 * 이 함수는 multipart/form-data 형식으로 전송된 파일을 처리합니다.
 * 
 * 요청이 성공적으로 처리되면, 업로드된 파일에 대한 응답을 반환합니다.
 * 
 * 요청 처리 과정:
 * 1. 요청에서 multipart/form-data 형식의 데이터를 읽어옵니다.
 * 2. 데이터가 없거나 비어있는 경우, 400 상태 코드와 함께 오류 메시지를 반환합니다.
 * 3. 업로드된 파일을 추출합니다.
 * 4. 파일을 외부 API에 POST 요청으로 전송합니다.
 * 5. 외부 API의 응답이 실패한 경우, 해당 상태 코드와 오류 메시지를 반환합니다.
 * 6. 성공적으로 업로드된 경우, 외부 API의 응답을 JSON 형식으로 반환합니다.
 */
export default defineEventHandler(async (event) => {
    // 요청에서 multipart/form-data 형식의 데이터를 읽어옵니다.
    const formData = await readMultipartFormData(event)
    
    // 데이터가 없거나 비어있는 경우, 400 상태 코드와 오류 메시지를 반환합니다.
    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No file uploaded', // 업로드된 파일이 없음을 나타내는 메시지
      })
    }
  
    // 업로드된 파일을 추출합니다.
    const file = formData[0]
  
    // 외부 API에 POST 요청으로 파일을 전송합니다.
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData, // 전송할 파일 데이터
    })
  
    // 외부 API의 응답이 실패한 경우, 해당 상태 코드와 오류 메시지를 반환합니다.
    if (!response.ok) {
      throw createError({
        statusCode: response.status, // 실패한 응답의 상태 코드
        statusMessage: 'Failed to upload file', // 파일 업로드 실패 메시지
      })
    }
  
    // 성공적으로 업로드된 경우, 외부 API의 응답을 JSON 형식으로 반환합니다.
    return response.json()
  })