import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { JwtTokens } from 'src/types/jwt-tokens.type';
import { UsersService } from 'src/users/users.service';

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
    return tokens;
  }

  async signIn(sub: number, email: string): Promise<JwtTokens> {
    const tokens = await this.generateTokens(sub, email);
    return tokens;
  }

  private async generateTokens(sub: number, email: string): Promise<JwtTokens> {
    const payload = { sub, email };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get('AT_SECRET'),
        expiresIn: this.config.get('AT_EXPIRES_IN'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get('RT_SECRET'),
        expiresIn: this.config.get('RT_EXPIRES_IN'),
      }),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async refreshTokens(id: number) {
    const user = await this.usersService.user({ id });
    if (!user) {
      throw new UnauthorizedException();
    }
    const tokens = await this.generateTokens(user.id, user.email);
    return tokens;
  }

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.user({ email });
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      return null;
    }
    const { password, ...result } = user;
    return result;
  }

  async getMe(id: number) {
    const user = await this.usersService.user({ id });
    if (!user) {
      return null;
    }
    const { password, ...result } = user;
    return result;
  }
}
