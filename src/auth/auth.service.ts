import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import ms from 'ms';
import { JwtTokens } from 'src/types/jwt-tokens.type';
import { UserSessionsService } from 'src/user-sessions/user-sessions.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private userSessionsService: UserSessionsService,
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
    await this.createUserSession(createdUser.id, tokens.refresh_token);
    return tokens;
  }

  async signIn(sub: number, email: string): Promise<JwtTokens> {
    const tokens = await this.generateTokens(sub, email);
    await this.createUserSession(sub, tokens.refresh_token);
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

  async refreshTokens(id: number, token: string) {
    const user = await this.usersService.user({ id });
    if (!user) {
      throw new UnauthorizedException();
    }
    const currentSession =
      await this.userSessionsService.getUserUserSessionByToken(id, token);
    if (!currentSession) {
      throw new UnauthorizedException();
    }
    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateUserSession(currentSession.id, tokens.refresh_token);

    return tokens;
  }

  private async createUserSession(id: number, token: string) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(token, salt);
    const expiresIn = this.config.get<string>('RT_EXPIRES_IN');
    const expiresAt = new Date(Date.now() + ms(expiresIn as ms.StringValue));
    await this.userSessionsService.createUserSession(hash, expiresAt, id);
  }

  private async updateUserSession(id: number, token: string) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(token, salt);
    const expiresIn = this.config.get<string>('RT_EXPIRES_IN');
    const expiresAt = new Date(Date.now() + ms(expiresIn as ms.StringValue));
    await this.userSessionsService.updateUserSession(id, expiresAt, hash);
  }

  async logOut(id: number, token: string) {
    const currentSession =
      await this.userSessionsService.getUserUserSessionByToken(id, token);
    if (!currentSession) {
      return;
    }
    await this.userSessionsService.deleteUserSession(currentSession.id);
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
