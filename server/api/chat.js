import prisma from '~/server/utils/prisma'
import OpenAI from 'openai';
import { handleApiError } from '~/server/utils/apiErrorHandlers'

// 채팅 및 OpenAI 연동 API
export default defineEventHandler(async (event) => {
  const { message, action, chatId, screenId, title, messages } = await readBody(event);

  if (action === 'chat') {
    try {
      const chat = screenId ? await prisma.chat.findUnique({ where: { screenId } }) : null;
      const chatMessages = chat ? JSON.parse(chat.messages) : [];
      
      chatMessages.push({ role: "user", content: message });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: chatMessages,
      });

      const aiResponse = completion.choices[0].message.content;
      chatMessages.push({ role: "assistant", content: aiResponse });

      const chatData = {
        messages: JSON.stringify(chatMessages),
        updatedAt: new Date()
      };

      const updatedChat = chat 
        ? await prisma.chat.update({ where: { screenId }, data: chatData })
        : await prisma.chat.create({ 
            data: { 
              screenId, 
              title: message.substring(0, 50), 
              ...chatData,
              createdAt: new Date()
            }
          });

      return { 
        success: true, 
        message: aiResponse, 
        model: completion.model, 
        created: completion.created, 
        chatId: updatedChat.id,
        screenId: updatedChat.screenId
      };
    } catch (error) {
      return handleApiError(error, '채팅 처리 중 오류가 발생했습니다.');
    }
  }

  if (action === 'load') {
    try {
      const chats = await prisma.chat.findMany({ orderBy: { updatedAt: 'desc' } });
      return { success: true, chats };
    } catch (error) {
      return handleApiError(error, '채팅 내역 로드 중 오류가 발생했습니다.');
    }
  }

  if (action === 'save') {
    try {
      if (!screenId) return handleApiError(null, '저장할 채팅 screenId가 제공되지 않았습니다.');
      
      const upsertedChat = await prisma.chat.upsert({
        where: { screenId },
        update: { title, messages, updatedAt: new Date() },
        create: { screenId, title, messages, createdAt: new Date(), updatedAt: new Date() }
      });
      
      return { success: true, message: '채팅이 성공적으로 저장되었습니다.', chat: upsertedChat };
    } catch (error) {
      return handleApiError(error, '채팅 저장 중 오류가 발생했습니다.');
    }
  }

  if (action === 'delete') {
    try {
      if (!screenId) return handleApiError(null, '삭제할 채팅 screenId가 제공되지 않았습니다.');
      
      await prisma.chat.delete({ where: { screenId } });
      return { success: true, message: '채팅이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      return handleApiError(error, '채팅 삭제 중 오류가 발생했습니다.');
    }
  }

  return handleApiError(null, '잘못된 액션입니다.');
});