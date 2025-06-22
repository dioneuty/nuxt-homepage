import { getBoardModel } from '~/server/utils/boardTypeMapper.js'
import { handleApiError } from '~/server/utils/apiErrorHandlers.js'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params.id)
  const query = getQuery(event)
  const boardType = query.boardType
  const body = await readBody(event)

  if (isNaN(id)) {
    handleApiError(null, 'Invalid post ID', 400);
  }

  if (!boardType) {
    handleApiError(null, 'Board type is required', 400);
  }

  try {
    const model = getBoardModel(boardType)
    let updateData = {}

    if (boardType === 'qna') {
      updateData = {
        questionTitle: body.title,
        questionContent: body.content,
        author: body.author || '관리자', // 필요에 따라 수정
        answerContent: body.answerContent, // QnA 전용 필드
        answerer: body.answerer, // QnA 전용 필드
      }
    } else {
      updateData = {
        title: body.title,
        content: body.content,
        author: body.author || '관리자', // 필요에 따라 수정
      }
    }

    const updatedPost = await model.update({
      where: { id: id },
      data: updateData,
    })

    return updatedPost
  } catch (error) {
    handleApiError(error, `Failed to update post for board type ${boardType}`, 500);
  }
}) 