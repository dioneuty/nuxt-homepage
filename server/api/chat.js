import prisma from '~/server/utils/prisma'
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화: 환경 변수에서 OpenAI API 키를 가져옵니다.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // API 키를 환경 변수에서 가져옵니다.
});

/**
 * @file 채팅 및 OpenAI 연동 API
 * @description 사용자 채팅 메시지 처리, OpenAI API를 통한 답변 생성, 채팅 내역 로드/저장/삭제 기능을 제공합니다.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { message, action, chatId, screenId, title, messages } = body;

  // 'chat' 액션 처리: 사용자 메시지를 OpenAI로 전송하고 응답을 받아 채팅 내역에 저장합니다.
  if (action === 'chat') {
    try {
      let chat;
      // 'screenId'가 제공된 경우 기존 채팅을 데이터베이스에서 조회합니다.
      if (screenId) {
        chat = await prisma.chat.findUnique({
          where: { screenId: screenId }
        });
      }

      // 기존 채팅 메시지가 있다면 JSON 파싱하여 사용하고, 없다면 빈 배열로 초기화합니다.
      // 여기에 현재 사용자 메시지를 추가합니다.
      const chatMessages = chat ? JSON.parse(chat.messages) : [];
      chatMessages.push({ role: "user", content: message });

      // OpenAI API를 호출하여 AI 응답을 생성합니다.
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini", // 사용할 OpenAI 모델을 지정합니다.
        messages: chatMessages, // 현재까지의 채팅 내역 (사용자 메시지 포함)을 전달합니다.
      });

      // AI 응답 내용('content')을 추출하여 채팅 내역에 'assistant' 역할로 추가합니다.
      const aiResponse = completion.choices[0].message.content;
      chatMessages.push({ role: "assistant", content: aiResponse });

      // 기존 채팅이 있는 경우 ('chat' 객체가 존재) 채팅 내역을 업데이트하고, 없는 경우 새로운 채팅을 생성합니다.
      if (chat) {
        await prisma.chat.update({
          where: { screenId: screenId }, // 'screenId'를 기준으로 업데이트할 채팅을 찾습니다.
          data: { 
            messages: JSON.stringify(chatMessages), // 업데이트된 채팅 내역을 JSON 문자열로 저장합니다.
            updatedAt: new Date() // 'updatedAt' 필드를 현재 시간으로 갱신합니다.
          }
        });
      } else {
        chat = await prisma.chat.create({
          data: {
            screenId: screenId, // 새로운 채팅의 고유 'screenId'를 설정합니다.
            title: message.substring(0, 50), // 사용자 메시지의 앞부분을 사용하여 채팅 제목을 생성합니다.
            messages: JSON.stringify(chatMessages), // 초기 채팅 내역을 JSON 문자열로 저장합니다.
            createdAt: new Date(), // 'createdAt' 필드를 현재 시간으로 설정합니다.
            updatedAt: new Date() // 'updatedAt' 필드를 현재 시간으로 설정합니다.
          }
        });
      }

      // 성공 응답과 함께 AI 응답 메시지, 사용된 모델 정보, 생성 시간, 채팅 ID, screenId를 반환합니다.
      return { 
        success: true, 
        message: aiResponse, 
        model: completion.model, 
        created: completion.created, 
        chatId: chat.id,
        screenId: chat.screenId
      };
    } catch (error) {
      // OpenAI API 호출 또는 채팅 처리 중 오류 발생 시 콘솔에 로그를 출력하고 실패 응답을 반환합니다.
      console.error('OpenAI API 오류:', error);
      return { success: false, error: '채팅 처리 중 오류가 발생했습니다.' };
    }
  } else if (action === 'load') {
    // 'load' 액션 처리: 데이터베이스에 저장된 모든 채팅 내역을 최신 업데이트 순으로 조회합니다.
    try {
      const chats = await prisma.chat.findMany({
        orderBy: { updatedAt: 'desc' } // 'updatedAt' 필드를 기준으로 내림차순 정렬하여 최신 채팅이 먼저 오도록 합니다.
      });
      return { success: true, chats }; // 성공 응답과 함께 조회된 채팅 목록을 반환합니다.
    } catch (error) {
      // 채팅 내역 로드 중 오류 발생 시 콘솔에 로그를 출력하고 실패 응답을 반환합니다.
      console.error('채팅 내역 로드 중 오류 발생:', error);
      return { success: false, error: '채팅 내역 로드 중 오류가 발생했습니다.' };
    }
  } else if (action === 'save') {
    // 'save' 액션 처리: 특정 'screenId'에 해당하는 채팅 내역을 업데이트하거나, 존재하지 않으면 새로 생성합니다.
    try {
      // 'screenId'가 제공되지 않으면 저장할 채팅을 특정할 수 없으므로 오류를 반환합니다.
      if (!screenId) {
        return { success: false, error: '저장할 채팅 screenId가 제공되지 않았습니다.' };
      }
      
      // 'screenId'를 기준으로 채팅 내역을 upsert (update + insert) 합니다.
      const upsertedChat = await prisma.chat.upsert({
        where: { screenId: screenId }, // 업데이트 또는 생성할 채팅을 찾기 위한 조건
        update: { // 기존 채팅이 존재할 경우 업데이트할 데이터
          title: title,
          messages: messages,
          updatedAt: new Date()
        },
        create: { // 기존 채팅이 존재하지 않을 경우 새로 생성할 데이터
          screenId: screenId,
          title: title,
          messages: messages,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return { success: true, message: '채팅이 성공적으로 저장되었습니다.', chat: upsertedChat }; // 성공 응답과 저장된 채팅 정보를 반환합니다.
    } catch (error) {
      // 채팅 저장 중 오류 발생 시 콘솔에 로그를 출력하고 실패 응답을 반환합니다.
      console.error('채팅 저장 중 오류 발생:', error);
      return { success: false, error: '채팅 저장 중 오류가 발생했습니다.' };
    }
  } else if (action === 'delete') {
    // 'delete' 액션 처리: 특정 'screenId'에 해당하는 채팅 내역을 데이터베이스에서 삭제합니다.
    try {
      // 'screenId'가 제공되지 않으면 삭제할 채팅을 특정할 수 없으므로 오류를 반환합니다.
      if (!screenId) {
        return { success: false, error: '삭제할 채팅 screenId가 제공되지 않았습니다.' };
      }
      
      // 'screenId'를 기준으로 채팅 내역을 삭제합니다.
      await prisma.chat.delete({
        where: { screenId: screenId } // 삭제할 채팅의 'screenId'를 지정합니다.
      });
      
      return { success: true, message: '채팅이 성공적으로 삭제되었습니다.' }; // 성공적으로 삭제되었음을 반환합니다.
    } catch (error) {
      // 채팅 삭제 중 오류 발생 시 콘솔에 로그를 출력하고 실패 응답을 반환합니다.
      console.error('채팅 삭제 중 오류 발생:', error);
      return { success: false, error: '채팅 삭제 중 오류가 발생했습니다.' };
    }
  } else {
    // 정의되지 않거나 유효하지 않은 'action' 값에 대한 오류 응답을 반환합니다.
    return { success: false, error: '잘못된 액션입니다.' };
  }
});