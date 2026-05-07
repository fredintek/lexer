import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './providers/chat.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'chat',
})
export class ChatGateway {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    // console.log(`Socket ${client.id} joined room: ${data.roomId}`);
  }

  // Handle incoming messages
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: {
      roomId: string;
      content: string;
      senderId: string;
      isAdmin: boolean;
    },
  ) {
    // 1. Get or create the room (using the roomId as the User ID identifier)
    const room = await this.chatService.getOrCreateRoom(data.roomId);

    // 2. Save to Database via ChatService
    const savedMsg = await this.chatService.saveMessage(
      room.id,
      data.content,
      data.isAdmin,
      data.senderId,
    );

    // 3. Broadcast to the specific room
    // We emit to data.roomId because that's the "Room Name" the client joined
    this.server.to(data.roomId).emit('newMessage', savedMsg);
  }
}
