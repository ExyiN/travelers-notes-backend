import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { User } from 'src/generated/prisma/client';
import { Serialize } from 'src/interceptors/serialize/serialize.interceptor';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { UserDto } from './dto/user.dto';
import { AccessJwtAuthGuard } from './guards/access-jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signUp(
    @Body() body: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const tokens = await this.authService.signUp(
      body.email,
      body.password,
      body.username,
    );
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
    });
    return { access_token: tokens.access_token };
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signIn(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as Omit<User, 'password' | 'refreshToken'>;
    const tokens = await this.authService.signIn(user.id, user.email);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
    });
    return { access_token: tokens.access_token };
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logOut(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('refresh_token');
  }

  @UseGuards(AccessJwtAuthGuard)
  @Serialize(UserDto)
  @Get('me')
  getMe(@Req() req: Request) {
    const user = req.user as { sub: number; email: string };
    return this.authService.getMe(user.sub);
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = req.user as {
      sub: number;
      email: string;
    };
    const tokens = await this.authService.refreshTokens(user.sub);
    res.cookie('refresh_token', tokens.refresh_token, {
      httpOnly: true,
    });
    return {
      access_token: tokens.access_token,
    };
  }
}
