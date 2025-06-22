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
    const deleteResult = await model.delete({
      where: { id: id },
    })

    if (!deleteResult) {
      handleApiError(null, 'Post not found or could not be deleted', 404);
    }

    return { message: 'Post deleted successfully' }
  } catch (error) {
    handleApiError(error, `Failed to delete post for board type ${boardType}`, 500);
  }
}) 