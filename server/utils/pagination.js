export function calculatePagination(page = 1, limit = 10) {
  const normalizedPage = Math.max(1, parseInt(page) || 1)
  const normalizedLimit = Math.max(1, Math.min(100, parseInt(limit) || 10))
  
  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit
  }
}

export async function executePaginatedQuery(model, options) {
  const { where = {}, orderBy = {}, include, select, page, limit } = options
  const { page: normalizedPage, limit: normalizedLimit, skip } = calculatePagination(page, limit)
  
  const findManyOptions = { where, orderBy, skip, take: normalizedLimit }
  
  if (include) findManyOptions.include = include
  else if (select) findManyOptions.select = select
  
  const [data, total] = await Promise.all([
    model.findMany(findManyOptions),
    model.count({ where })
  ])
  
  return formatPaginationResult(data, total, normalizedPage, normalizedLimit)
}

export function formatPaginationResult(data, total, page, limit) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    posts: data,
    total,
    page,
    itemsPerPage: limit,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1
  }
}

export async function simplePaginatedQuery(model, where = {}, page = 1, limit = 10, orderBy = { id: 'desc' }) {
  return await executePaginatedQuery(model, { where, orderBy, page, limit })
} 