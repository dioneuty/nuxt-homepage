import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // API 키를 환경 변수에서 가져옵니다.
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { message, action, chatId, screenId, title, messages } = body;

  if (action === 'chat') {
    try {
      let chat;
      if (screenId) {
        chat = await prisma.chat.findUnique({
          where: { screenId: screenId }
        });
      }

      const chatMessages = chat ? JSON.parse(chat.messages) : [];
      chatMessages.push({ role: "user", content: message });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
      });

      const aiResponse = completion.choices[0].message.content;
      chatMessages.push({ role: "assistant", content: aiResponse });

      if (chat) {
        await prisma.chat.update({
          where: { screenId: screenId },
          data: { 
            messages: JSON.stringify(chatMessages),
            updatedAt: new Date()
          }
        });
      } else {
        chat = await prisma.chat.create({
          data: {
            screenId: screenId,
            title: message.substring(0, 50),
            messages: JSON.stringify(chatMessages),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
      }

      return { 
        success: true, 
        message: aiResponse, 
        model: completion.model, 
        created: completion.created, 
        chatId: chat.id,
        screenId: chat.screenId
      };
    } catch (error) {
      console.error('OpenAI API 오류:', error);
      return { success: false, error: '채팅 처리 중 오류가 발생했습니다.' };
    }
  } else if (action === 'load') {
    try {
      const chats = await prisma.chat.findMany({
        orderBy: { updatedAt: 'desc' }
      });
      return { success: true, chats };
    } catch (error) {
      console.error('채팅 내역 로드 중 오류 발생:', error);
      return { success: false, error: '채팅 내역 로드 중 오류가 발생했습니다.' };
    }
  } else if (action === 'save') {
    try {
      if (!screenId) {
        return { success: false, error: '저장할 채팅 screenId가 제공되지 않았습니다.' };
      }
      
      const upsertedChat = await prisma.chat.upsert({
        where: { screenId: screenId },
        update: {
          title: title,
          messages: messages,
          updatedAt: new Date()
        },
        create: {
          screenId: screenId,
          title: title,
          messages: messages,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      return { success: true, message: '채팅이 성공적으로 저장되었습니다.', chat: upsertedChat };
    } catch (error) {
      console.error('채팅 저장 중 오류 발생:', error);
      return { success: false, error: '채팅 저장 중 오류가 발생했습니다.' };
    }
  } else if (action === 'delete') {
    try {
      if (!screenId) {
        return { success: false, error: '삭제할 채팅 screenId가 제공되지 않았습니다.' };
      }
      
      await prisma.chat.delete({
        where: { screenId: screenId }
      });
      
      return { success: true, message: '채팅이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      console.error('채팅 삭제 중 오류 발생:', error);
      return { success: false, error: '채팅 삭제 중 오류가 발생했습니다.' };
    }
  } else {
    return { success: false, error: '잘못된 액션입니다.' };
  }
});