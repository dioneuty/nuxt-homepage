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
    const deleteResult = await model.delete({
      where: { id: id },
    })

    if (!deleteResult) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Post not found or could not be deleted',
      })
    }

    return { message: 'Post deleted successfully' }
  } catch (error) {
    console.error(`Failed to delete post ${id} for board type ${boardType}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete post for board type ${boardType}`,
    })
  }
}) 