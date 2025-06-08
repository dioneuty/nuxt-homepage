import { getBoardModel } from '~/server/utils/boardTypeMapper.js'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params.id)
  const query = getQuery(event)
  const boardType = query.boardType
  const body = await readBody(event)

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid post ID',
    })
  }

  if (!boardType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Board type is required',
    })
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
    console.error(`Failed to update post ${id} for board type ${boardType}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to update post for board type ${boardType}`,
    })
  }
}) 