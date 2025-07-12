import { getBoardModel } from '~/server/utils/boardTypeMapper.js'
import { handleApiError } from '~/server/utils/apiErrorHandlers.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { boardType, page = '1', itemsPerPage = '10', type: searchType = 'title', text: searchText = '', sortColumn = 'createdAt', sortOrder = 'desc' } = query

  if (!boardType) handleApiError(event, 400, 'Board type is required')

  try {
    const model = getBoardModel(boardType)
    
    const whereClause = searchText ? (
      boardType === 'qna' 
        ? { OR: [
            { questionTitle: { contains: searchText, mode: 'insensitive' } },
            { questionContent: { contains: searchText, mode: 'insensitive' } }
          ]}
        : { [searchType]: { contains: searchText, mode: 'insensitive' } }
    ) : {}

    const [posts, total] = await Promise.all([
      model.findMany({
        where: whereClause,
        skip: (parseInt(page) - 1) * parseInt(itemsPerPage),
        take: parseInt(itemsPerPage),
        orderBy: { [sortColumn]: sortOrder }
      }),
      model.count({ where: whereClause })
    ])

    return { posts, total }
  } catch (error) {
    handleApiError(event, 500, `Failed to fetch posts for board type ${boardType}`, error)
  }
}) 