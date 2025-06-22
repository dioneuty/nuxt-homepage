import { getBoardModel } from '~/server/utils/boardTypeMapper.js'
import { handleApiError } from '~/server/utils/apiErrorHandlers.js'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params.id)
  const query = getQuery(event)
  const boardType = query.boardType

  if (isNaN(id)) {
    handleApiError(null, 'Invalid post ID', 400);
  }

  if (!boardType) {
    handleApiError(null, 'Board type is required', 400);
  }

  try {
    const model = getBoardModel(boardType)

    let post
    if (boardType === 'qna') {
      post = await model.findUnique({
        where: { id: id },
        select: {
          id: true,
          questionTitle: true,
          questionContent: true,
          author: true,
          answerContent: true,
          answerer: true,
          createdAt: true,
          updatedAt: true,
        },
      })
    } else {
      post = await model.findUnique({
        where: { id: id },
      })
    }

    if (!post) {
      handleApiError(null, 'Post not found', 404);
    }

    return post
  } catch (error) {
    handleApiError(error, `Failed to fetch post for board type ${boardType}`, 500);
  }
}) 