import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { User } from '../../database/entities/user.entity';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from './strategies/jwt.strategy';

// expiresIn uchun type
interface JwtResetPayload {
  sub: string;
  type: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepo: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, isActive: true },
    });

    if (!user) throw new UnauthorizedException("Email yoki parol noto'g'ri");

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException("Email yoki parol noto'g'ri");

    await this.userRepo.update(user.id, { lastLogin: new Date() });

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        lang: user.lang,
      },
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token yaroqsiz');
    }

    // IsNull() — null as any o'rniga
    const stored = await this.refreshTokenRepo.findOne({
      where: { userId: payload.sub, revokedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token muddati o'tgan");
    }

    const isValid = await bcrypt.compare(refreshToken, stored.tokenHash);
    if (!isValid) throw new UnauthorizedException("Refresh token noto'g'ri");

    await this.refreshTokenRepo.update(stored.id, { revokedAt: new Date() });

    // user null bo'lishi mumkin — tekshiramiz
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('Foydalanuvchi topilmadi');

    const tokens = await this.generateTokens(user);
    await this.saveRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  async logout(userId: string) {
    await this.refreshTokenRepo
      .createQueryBuilder()
      .update()
      .set({ revokedAt: new Date() })
      .where('user_id = :userId AND revoked_at IS NULL', { userId })
      .execute();

    return { message: 'Muvaffaqiyatli chiqildi' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: "Agar email mavjud bo'lsa, havola yuborildi" };
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, type: 'reset' } satisfies JwtResetPayload,
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') as string,
        expiresIn: '1h',
      },
    );

    // TODO: Email service
    console.log(`Reset token for ${user.email}: ${resetToken}`);

    return { message: "Agar email mavjud bo'lsa, havola yuborildi" };
  }

  async resetPassword(dto: ResetPasswordDto) {
    let payload: JwtResetPayload;
    try {
      payload = this.jwtService.verify<JwtResetPayload>(dto.token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') as string,
      });
    } catch {
      throw new BadRequestException("Token yaroqsiz yoki muddati o'tgan");
    }

    if (payload.type !== 'reset') {
      throw new BadRequestException("Token turi noto'g'ri");
    }

    const hash = await bcrypt.hash(dto.newPassword, 12);
    await this.userRepo.update(payload.sub, { passwordHash: hash });

    return { message: 'Parol muvaffaqiyatli yangilandi' };
  }

  private async generateTokens(user: User) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET') as string,
        // string o'rniga ms library tipiga mos keladi
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET') as string,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(userId: string, token: string) {
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.refreshTokenRepo.save({
      userId,
      tokenHash,
      expiresAt,
    });
  }
}
