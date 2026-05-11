import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PaymentService } from './providers/payment.service';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { CreatePaymentMethodDto } from './dtos/payment.dto';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';
import { UserStatus } from 'src/auth/decorators/auth.decorator';

@Controller('payment')
export class PaymentController {
  constructor(private readonly service: PaymentService) {}

  @Get()
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getMyMethods(@ActiveUser() currentUser: ActiveUserInterface) {
    return this.service.findAll(currentUser);
  }

  @Post()
  async addMethod(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Body() createPaymentMethodDto: CreatePaymentMethodDto,
  ) {
    return this.service.create(currentUser, createPaymentMethodDto);
  }

  @Patch(':id/primary')
  async makePrimary(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Param('id') id: string,
  ) {
    return this.service.setPrimary(currentUser, id);
  }

  @Delete(':id')
  async deleteMethod(
    @ActiveUser() currentUser: ActiveUserInterface,
    @Param('id') id: string,
  ) {
    return this.service.remove(currentUser, id);
  }
}
