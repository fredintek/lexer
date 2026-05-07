import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './providers/chat.service';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { Permissions } from 'src/auth/decorators/auth.decorator';
import { PERMISSIONS } from 'src/lib/permissions';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history')
  async getMyHistory(@ActiveUser() currentUser: ActiveUserInterface) {
    return this.chatService.getRoomHistory(currentUser);
  }

  @Get('/rooms')
  @Permissions(PERMISSIONS.CAN_MANAGE_CHATS)
  async getAllRooms() {
    return this.chatService.findAllRooms();
  }

  @Get('/rooms/:roomId/messages')
  @Permissions(PERMISSIONS.CAN_MANAGE_CHATS)
  async getRoomMessages(@Param('roomId') roomId: string) {
    return this.chatService.getMessagesByRoom(roomId);
  }
}
