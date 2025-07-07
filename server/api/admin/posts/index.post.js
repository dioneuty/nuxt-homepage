import { getBoardModel } from '~/server/utils/boardTypeMapper.js'
import { handleApiError } from '~/server/utils/apiErrorHandlers.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const boardType = query.boardType
  const body = await readBody(event)

  if (!boardType) {
    handleApiError(event, 400, 'Board type is required');
  }

  try {
    const model = getBoardModel(boardType)
    let newPostData = {}

    if (boardType === 'qna') {
      newPostData = {
        questionTitle: body.title,
        questionContent: body.content,
        author: body.author || '관리자',
      }
    } else {
      newPostData = {
        title: body.title,
        content: body.content,
        author: body.author || '관리자',
      }
    }

    const newPost = await model.create({
      data: newPostData,
    })

    return newPost
  } catch (error) {
    handleApiError(event, 500, `Failed to create post for board type ${boardType}`, error);
  }
}) 