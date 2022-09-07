import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import {JwtModule} from "@nestjs/jwt";
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AtStrategy, RtStrategy } from '../common/strategies';
import { SessionHash, SessionHashSchema } from './session-hash.schema';

@Module({
  imports: [
              ConfigModule,
              PassportModule,
              MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
              MongooseModule.forFeature([{ name: SessionHash.name, schema: SessionHashSchema }]),
              JwtModule.register({})
            ],
  providers: [UserService, AtStrategy, RtStrategy],
  controllers: [UserController],
  exports: [UserService]
})
export class UserModule {}
