import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
// import { LoggerModule } from '../logger/logger.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    PassportModule,
    // LoggerModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          privateKey: configService.get<string>('keys.privateKey'),
          publicKey: configService.get<string>('keys.publicKey'),
          signOptions: { expiresIn: '60s', algorithm: 'RS256' },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [JwtStrategy, AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
