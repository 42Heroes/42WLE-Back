import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { BoardModule } from './board/board.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_DB, {
      connectionFactory: (connection) => {
        connection.plugin(require('mongoose-autopopulate'));
        return connection;
      },
    }),
    UserModule,
    AuthModule,
    EventsModule,
    ChatModule,
    BoardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
