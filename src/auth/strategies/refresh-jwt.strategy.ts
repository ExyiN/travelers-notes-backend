import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'refresh-jwt',
) {
  constructor(private config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies['refresh_token'],
      ]),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('RT_SECRET'),
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: { sub: number; email: string }) {
    return payload;
  }
}
