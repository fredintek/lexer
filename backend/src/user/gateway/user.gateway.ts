import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UserService } from '../providers/user.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'users',
})
export class UserGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  // userId → Set of socketIds (handles multiple tabs)
  private onlineUsers = new Map<string, Set<string>>();

  constructor(private readonly userService: UserService) {}

  handleConnection(client: any) {
    const userId = client.handshake.query?.userId as string;

    if (!userId) return;

    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(client.id);

    this.emitCount();
  }

  handleDisconnect(client: any) {
    const userId = client.handshake.query?.userId as string;

    if (!userId) return;

    const sockets = this.onlineUsers.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.onlineUsers.delete(userId);
      }
    }

    this.emitCount();
  }

  private async emitCount() {
    const ids = Array.from(this.onlineUsers.keys());
    const users = await this.userService.getUserDetailsByIds(ids);

    this.server.emit('online_users_count', {
      count: this.onlineUsers.size,
      data: users,
    });
  }
}
