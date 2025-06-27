import type { StorageConfig, StorageProvider } from './interfaces'
import { GitHubStorageProvider } from './providers/github-provider.js'
import { S3StorageProvider } from './providers/s3-provider.js'

export class StorageFactory {
  /**
   * 根据配置创建存储提供商实例
   * @param config 存储配置
   * @returns 存储提供商实例
   */
  static createProvider(config: StorageConfig): StorageProvider {
    switch (config.provider) {
      case 's3': {
        return new S3StorageProvider(config)
      }
      case 'github': {
        return new GitHubStorageProvider(config)
      }
    }
  }
}
