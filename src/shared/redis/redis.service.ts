import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const url = this.configService.get<string>('redis.url');

    if (url) {
      // Upstash — TLS bilan
      this.client = new Redis(url, {
        tls: { rejectUnauthorized: false },
      });
    } else {
      this.client = new Redis({
        host: this.configService.get<string>('redis.host') ?? 'localhost',
        port: this.configService.get<number>('redis.port') ?? 6379,
      });
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.client.setex(key, seconds, value);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
