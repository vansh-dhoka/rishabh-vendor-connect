export function getPaginationParams(req) {
  const limit = Math.min(Number(req.query.limit || 50), 200) // Max 200 items per page
  const offset = Number(req.query.offset || 0)
  const page = Math.max(Number(req.query.page || 1), 1)
  
  return {
    limit,
    offset: offset || (page - 1) * limit,
    page
  }
}

export function getPaginationResponse(items, total, limit, offset, page) {
  const totalPages = Math.ceil(total / limit)
  
  return {
    items,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
      offset,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

export function addPaginationToQuery(baseQuery, limit, offset) {
  return `${baseQuery} LIMIT ${limit} OFFSET ${offset}`
}

export function getCountQuery(baseQuery) {
  // Extract the FROM clause and convert to COUNT query
  const fromMatch = baseQuery.match(/FROM\s+(.+?)(?:\s+WHERE|\s+ORDER|\s+GROUP|\s+HAVING|$)/i)
  if (!fromMatch) return null
  
  const fromClause = fromMatch[1]
  const whereMatch = baseQuery.match(/WHERE\s+(.+?)(?:\s+ORDER|\s+GROUP|\s+HAVING|$)/i)
  const whereClause = whereMatch ? `WHERE ${whereMatch[1]}` : ''
  
  return `SELECT COUNT(*) as total FROM ${fromClause} ${whereClause}`
}
