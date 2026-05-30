/**
 * 数据库全量导出脚本
 *
 * 用法: npx ts-node prisma/dump.ts
 *
 * 通过 Prisma Client 逐表读取数据，生成标准 SQL INSERT 语句。
 * 不依赖 pg_dump 或任何外部工具。
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('❌ DATABASE_URL 未设置')
  process.exit(1)
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

/**
 * 转义 SQL 字符串值（处理单引号和反斜杠）
 */
function esc(val: any): string {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'number') return String(val)
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  // Date 类型 → ISO 字符串
  if (val instanceof Date) {
    return `'${val.toISOString()}'`
  }
  // JSON / 大对象
  if (typeof val === 'object') {
    return `'${JSON.stringify(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`
  }
  return `'${String(val).replace(/'/g, "''").replace(/\\/g, '\\\\')}'`
}

interface TableInfo {
  tableName: string
  columns: { name: string; type: string }[]
}

async function getTables(): Promise<TableInfo[]> {
  const rows: any[] = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name NOT IN ('_prisma_migrations', 'prisma_migrations')
    ORDER BY table_name, ordinal_position
  `)
  const map = new Map<string, { name: string; type: string }[]>()
  for (const r of rows) {
    if (!map.has(r.table_name)) map.set(r.table_name, [])
    map.get(r.table_name)!.push({ name: r.column_name, type: r.data_type })
  }
  return Array.from(map.entries()).map(([tableName, columns]) => ({ tableName, columns }))
}

async function main() {
  console.log('📦 正在连接数据库...')
  const tables = await getTables()

  const date = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const outFile = path.resolve(__dirname, `dump-${date}.sql`)
  const lines: string[] = [
    `-- ============================================`,
    `-- Nest PMS 数据库全量导出`,
    `-- 导出时间: ${new Date().toLocaleString()}`,
    `-- 注意: 导入前需先建表 (prisma migrate deploy)`,
    `-- ============================================`,
    ``,
    `BEGIN;`,
    ``,
  ]

  let totalRows = 0

  for (const table of tables) {
    // 读取该表所有数据
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM "${table.tableName}" ORDER BY (SELECT NULL)`
    )
    if (rows.length === 0) continue

    const colNames = table.columns.map((c) => `"${c.name}"`).join(', ')
    const batchSize = 100

    lines.push(`-- ${table.tableName} (${rows.length} 行)\n`)

    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize)
      const values = batch.map((row) => {
        const vals = table.columns.map((c) => esc(row[c.name]))
        return `(${vals.join(', ')})`
      })
      lines.push(
        `INSERT INTO "${table.tableName}" (${colNames}) VALUES`,
        values.join(',\n') + ';'
      )
    }

    // 修正序列
    lines.push(
      `SELECT setval(pg_get_serial_sequence('"${table.tableName}"', 'id'), COALESCE((SELECT MAX("id") FROM "${table.tableName}"), 1)) WHERE EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='${table.tableName}' AND column_name='id' AND column_default LIKE 'nextval%');`
    )
    lines.push('')

    totalRows += rows.length
    console.log(`  ✅ ${table.tableName}: ${rows.length} 行`)
  }

  lines.push(`COMMIT;`)
  lines.push('')

  fs.writeFileSync(outFile, lines.join('\n'), 'utf-8')
  console.log(`\n🎉 导出完成: ${outFile} (${totalRows} 行，${tables.length} 个表)`)
  console.log(`\n导入命令:`)
  console.log(`  psql -U postgres -h <主机> -d <数据库> -f "${outFile}"`)
}

main()
  .catch((e) => {
    console.error('❌ 导出失败:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
