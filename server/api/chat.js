import { PrismaClient } from '@prisma/client'
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // API 키를 환경 변수에서 가져옵니다.
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { message, action, chatId, title, messages } = body;

  if (action === 'chat') {
    try {
      let chat;
      if (chatId) {
        chat = await prisma.chat.findUnique({
          where: { id: parseInt(chatId) }
        });
      }

      const messages = chat ? JSON.parse(chat.messages) : [];
      messages.push({ role: "user", content: message });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
      });

      const aiResponse = completion.choices[0].message.content;
      messages.push({ role: "assistant", content: aiResponse});

    //   if (chatId) {
    //     await prisma.chat.update({
    //       where: { id: parseInt(chatId) },
    //       data: { messages: JSON.stringify(messages) }
    //     });
    //   } else {
    //     await prisma.chat.create({
    //       data: {
    //         title: message.substring(0, 50),
    //         messages: JSON.stringify(messages)
    //       }
    //     });
    //   }

      return { success: true, message: aiResponse, model: completion.model, created: completion.created, chatId: completion.created };
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
      if (!chatId) {
        return { success: false, error: '저장할 채팅 ID가 제공되지 않았습니다.' };
      }
      
      const upsertedChat = await prisma.chat.upsert({
        where: { id: parseInt(chatId) },
        update: {
          title: title,
          messages: JSON.stringify(messages),
          updatedAt: new Date()
        },
        create: {
          id: parseInt(chatId),
          title: title,
          createdAt: new Date(),
          messages: JSON.stringify(messages)
        }
      });
      
      return { success: true, message: '채팅이 성공적으로 저장되었습니다.', chat: upsertedChat };
    } catch (error) {
      console.error('채팅 저장 중 오류 발생:', error);
      return { success: false, error: '채팅 저장 중 오류가 발생했습니다.' };
    }
  } else if (action === 'delete') {
    try {
      if (!chatId) {
        return { success: false, error: '삭제할 채팅 ID가 제공되지 않았습니다.' };
      }
      
      await prisma.chat.delete({
        where: { id: parseInt(chatId) }
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