import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  console.log('holidays api called')
  const { year, month } = getQuery(event)
  const holidays = await prisma.holiday.findMany({
    where: {
      year: parseInt(year),
      month: parseInt(month)
    }
  })
  return holidays
})