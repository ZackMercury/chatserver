import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    UserModule, 
    ConfigModule.forRoot(), 
    MongooseModule.forRoot(process.env.DB_CONNECTION), ChatModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
