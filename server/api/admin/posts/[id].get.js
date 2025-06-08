import { getBoardModel } from '~/server/utils/boardTypeMapper.js'

export default defineEventHandler(async (event) => {
  const id = parseInt(event.context.params.id)
  const query = getQuery(event)
  const boardType = query.boardType

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
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found',
      })
    }

    return post
  } catch (error) {
    console.error(`Failed to fetch post ${id} for board type ${boardType}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch post for board type ${boardType}`,
    })
  }
}) 