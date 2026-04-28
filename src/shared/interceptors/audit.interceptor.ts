import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/audit-log.entity';
import { User } from '../../database/entities/user.entity';

interface RequestWithUser {
  user?: User;
  method: string;
  url: string;
  ip: string;
  body: Record<string, unknown>;
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { method, url, ip, user, body } = request;

    if (!['POST', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      // async o'rniga void + ichida catch
      tap(() => {
        if (!user) return;

        const entityType = url.split('/')[2] ?? 'unknown';
        const action =
          method === 'POST' ? 'CREATE' : method === 'PUT' ? 'UPDATE' : 'DELETE';

        void this.auditRepo
          .save({
            userId: user.id,
            action,
            entityType,
            newValue: body,
            ipAddress: ip,
          })
          .catch((err: unknown) => {
            console.error('Audit log xatosi:', err);
          });
      }),
    );
  }
}
