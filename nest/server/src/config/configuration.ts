/**
 * 应用配置 — 集中管理所有环境变量
 *
 * 所有硬编码值都应放在这里，运行时通过 ConfigService 读取。
 * NODE_ENV=production 时会加载 .env.prod（覆盖 .env 的值）。
 */

export interface AppConfig {
  port: number
  nodeEnv: string
  isProd: boolean
  database: {
    url: string
  }
  jwt: {
    secret: string
    expiresIn: string
  }
  cors: {
    origin: string
  }
  log: {
    level: string
  }
  app: {
    name: string
    apiPrefix: string
  }
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/nest',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'nest-jwt-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
  },

  app: {
    name: 'PMS 权限管理系统',
    apiPrefix: 'api',
  },
})
