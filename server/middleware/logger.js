import { defineEventHandler, getQuery } from 'h3'
import Database from 'better-sqlite3'
import path from 'path'
import logger from '../utils/logger'

const dbPath = path.join(process.cwd(), 'server/db/database.sqlite')
let db

// 쿼리 실행을 래핑하는 함수
function executeQuery(query, method, params = []) {
    const start = Date.now()
    const result = method.apply(query, params)
    const end = Date.now()
    logger.info('Database query executed', {
      query: query.source,
      params: JSON.stringify(params),
      executionTime: `${end - start} ms`
    })
    return result
}
  
export default defineEventHandler((event) => {
    if (!db) {
        try {
            db = new Database(dbPath)

            // 원본 run 메서드를 저장
            const originalRun = db.prepare.prototype.run
            const originalGet = db.prepare.prototype.get
            const originalAll = db.prepare.prototype.all
            const originalEach = db.prepare.prototype.each

            // run 메서드를 오버라이드
            db.prepare.prototype.run = function(...params) {
                return executeQuery(this, originalRun, params)
            }
            db.prepare.prototype.get = function(...params) {
                return executeQuery(this, originalGet, params)
            }
            db.prepare.prototype.all = function(...params) {
                return executeQuery(this, originalAll, params)
            }
            db.prepare.prototype.each = function(...params) {
                return executeQuery(this, originalEach, params)
            }

            // 기존 db 객체를 새로운 프로파일링된 객체로 교체
            event.context.db = db

            // 데이터베이스 연결 테스트
            /*const testQuery = db.prepare('SELECT 1')
            const result = testQuery.get()
            logger.info('Database connection test result', { result })*/
        } catch (error) {
            logger.error('Database connection error', { error: error.message })
            // 오류 발생 시 적절한 처리
        }
    }

    // logger.info('Request received', {
    //     url: event.node.req.url,
    //     method: event.node.req.method,
    //     query: getQuery(event)
    // })
})