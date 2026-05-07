import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { YfinanceService } from '../providers/yfinance.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: 'trade',
})
export class TradeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private globalInterval: NodeJS.Timeout | null = null;
  private readonly logger = new Logger(TradeGateway.name);

  constructor(private readonly yfService: YfinanceService) {}

  private connectedClients = new Set<string>();

  handleConnection(client: any) {
    this.connectedClients.add(client.id);
    this.manageStream();
  }

  handleDisconnect(client: any) {
    this.connectedClients.delete(client.id);
    this.manageStream();
  }

  private manageStream() {
    const clientCount = this.connectedClients.size;

    if (clientCount > 0 && !this.globalInterval) {
      this.logger.log('🚀 Starting Global Market Stream (Users Online)');

      this.fetchAndEmit();

      this.globalInterval = setInterval(async () => {
        await this.fetchAndEmit();
      }, 12000);
    } else if (clientCount === 0 && this.globalInterval) {
      this.logger.log('😴 Stopping Global Market Stream (No Users Online)');
      clearInterval(this.globalInterval);
      this.globalInterval = null;
    }
  }

  private async fetchAndEmit() {
    try {
      const data = await this.yfService.getLiveMarkets();

      if (data) {
        this.server.emit('marketUpdate', data);
      }
    } catch (error) {
      this.logger.error('Streaming Error: API connection failed');
    }
  }
}
