import type { S3ClientConfig } from '@aws-sdk/client-s3'
import { S3Client } from '@aws-sdk/client-s3'
import { env } from '@env'

// 创建 S3 客户端
function createS3Client(): S3Client {
  if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
    throw new Error('S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY are required')
  }

  const s3ClientConfig: S3ClientConfig = {
    region: env.S3_REGION,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
    // 禁用 checksum header，解决与 S3 兼容存储的兼容性问题
    defaultsMode: 'legacy',
    // 强制使用路径样式的 URL（对于非 AWS 的 S3 兼容存储很重要）
    forcePathStyle: true,
  }

  // 如果提供了自定义端点，则使用它
  if (env.S3_ENDPOINT) {
    s3ClientConfig.endpoint = env.S3_ENDPOINT
  }

  const client = new S3Client(s3ClientConfig)

  // 仅在 finalizeRequest 阶段移除所有 checksum 请求头，简化代码
  client.middlewareStack.add(
    (next) => async (args) => {
      const request = args.request as { headers?: Record<string, string> }
      if (request.headers) {
        delete request.headers['x-amz-checksum-mode']
        delete request.headers['x-amz-checksum-crc32']
      }
      return next(args)
    },
    {
      step: 'finalizeRequest',
    },
  )

  return client
}

export const s3Client = createS3Client()
