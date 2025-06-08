import { getBoardModel } from '~/server/utils/boardTypeMapper.js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const boardType = query.boardType
  const body = await readBody(event)

  if (!boardType) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Board type is required',
    })
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
    console.error(`Failed to create post for board type ${boardType}:`, error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to create post for board type ${boardType}`,
    })
  }
}) 