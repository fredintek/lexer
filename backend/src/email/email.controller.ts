import { Body, Controller, Post } from '@nestjs/common';
import { Permissions } from 'src/auth/decorators/auth.decorator';
import { SendBroadcastDto } from './dtos';
import { EmailService } from './providers/email.service';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { PERMISSIONS } from 'src/lib/permissions';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}
  @Post('broadcast')
  @Permissions(PERMISSIONS.CAN_BROADCAST_EMAIL)
  async sendBroadcast(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() sendBroadcastDto: SendBroadcastDto,
  ) {
    return this.emailService.broadcastEmail(sendBroadcastDto, currentUser);
  }
}
