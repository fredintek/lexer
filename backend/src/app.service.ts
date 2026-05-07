import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public checkApiHealth() {
    return {
      status: 'UP',
      timestamp: new Date().toISOString(),
      message: 'Api is running...',
    };
  }
}
