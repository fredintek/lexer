import { Module } from '@nestjs/common';
import { ChatService } from './providers/chat.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatRoom } from './entities/chatRoom.entity';
import { Message } from './entities/message.entity';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { User } from 'src/user/entities/user.entity';

@Module({
  providers: [ChatService, ChatGateway],
  imports: [TypeOrmModule.forFeature([ChatRoom, Message, User])],
  exports: [ChatService],
  controllers: [ChatController]
})
export class ChatModule {}
