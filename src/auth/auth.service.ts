import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtTokens } from 'src/types/jwt-tokens.type';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(
    email: string,
    password: string,
    username: string,
  ): Promise<JwtTokens> {
    const user = await this.usersService.user({ email });
    if (user) {
      throw new BadRequestException('User already exists');
    }

    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(password, salt);
    const createdUser = await this.usersService.createUser({
      email,
      password: hash,
      username,
    });

    const tokens = await this.generateTokens(createdUser.id, createdUser.email);
    await this.updateRefreshToken(createdUser.id, tokens.refresh_token);
    return tokens;
  }

  async signIn(sub: number, email: string): Promise<JwtTokens> {
    const tokens = await this.generateTokens(sub, email);
    await this.updateRefreshToken(sub, tokens.refresh_token);
    return tokens;
  }

  private async generateTokens(sub: number, email: string): Promise<JwtTokens> {
    const payload = { sub, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(id: number, token: string) {
    const user = await this.usersService.user({ id });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }
    const isMatch = await bcrypt.compare(token, user.refreshToken);
    if (!isMatch) {
      throw new UnauthorizedException();
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return tokens;
  }

  private async updateRefreshToken(id: number, token: string) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(token, salt);
    await this.usersService.updateUser({
      where: { id },
      data: { refreshToken: hash },
    });
  }

  async logOut(id: number) {
    await this.usersService.updateUser({
      where: { id, refreshToken: { not: null } },
      data: { refreshToken: null },
    });
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.user({ email });
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      return null;
    }
    const { password, refreshToken, ...result } = user;
    return result;
  }

  async getMe(id: number) {
    const user = await this.usersService.user({ id });
    if (!user) {
      return null;
    }
    const { password, refreshToken, ...result } = user;
    return result;
  }
}
