import { getBoardModel } from '~/server/utils/boardTypeMapper.js'
import { handleApiError } from '~/server/utils/apiErrorHandlers.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const boardType = query.boardType
  const page = parseInt(query.page || '1')
  const itemsPerPage = parseInt(query.itemsPerPage || '10')
  const searchType = query.type || 'title'
  const searchText = query.text || ''
  const sortColumn = query.sortColumn || 'createdAt'
  const sortOrder = query.sortOrder || 'desc' // 최신순 기본값

  if (!boardType) {
    handleApiError(null, 'Board type is required', 400);
  }

  try {
    const model = getBoardModel(boardType)

    let whereClause = {}

    // Add search conditions
    if (searchText) {
      if (boardType === 'qna') {
        // QnA model has questionTitle, not title
        whereClause = {
          OR: [
            { questionTitle: { contains: searchText, mode: 'insensitive' } },
            { questionContent: { contains: searchText, mode: 'insensitive' } },
          ],
        }
      } else {
        whereClause = {
          [searchType]: { contains: searchText, mode: 'insensitive' },
        }
      }
    }

    const [posts, total] = await Promise.all([
      model.findMany({
        where: whereClause,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: { [sortColumn]: sortOrder },
      }),
      model.count({
        where: whereClause,
      }),
    ])

    return {
      posts,
      total,
    }
  } catch (error) {
    handleApiError(error, `Failed to fetch posts for board type ${boardType}`, 500);
  }
}) 