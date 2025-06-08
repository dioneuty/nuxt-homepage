import { getBoardModel } from '~/server/utils/boardTypeMapper'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const boardType = query.boardType as string
  const page = parseInt(query.page as string || '1')
  const itemsPerPage = parseInt(query.itemsPerPage as string || '10')
  const searchType = query.type as string || 'title'
  const searchText = query.text as string || ''
  const sortColumn = query.sortColumn as string || 'createdAt'
  const sortOrder = query.sortOrder as 'asc' | 'desc' || 'desc' // 최신순 기본값

  if (!boardType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Board type is required',
    })
  }

  try {
    const model = getBoardModel(boardType)

    let whereClause: any = {}

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
    console.error(`Failed to fetch posts for board type ${boardType}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to fetch posts for board type ${boardType}`,
    })
  }
}) 