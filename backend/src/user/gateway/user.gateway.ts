import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'users',
})
export class UserGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private onlineCount = 0;

  handleConnection(client: any) {
    this.onlineCount++;
    this.server.emit('online_users_count', this.onlineCount);
  }

  handleDisconnect(client: any) {
    this.onlineCount--;
    this.server.emit('online_users_count', this.onlineCount);
  }
}
