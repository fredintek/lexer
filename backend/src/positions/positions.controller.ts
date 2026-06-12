import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PositionsService } from './providers/positions.service';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import {
  CreatePositionDto,
  EditUserPositionDto,
  SellPositionDto,
} from './dtos';
import { Permissions, UserStatus } from 'src/auth/decorators/auth.decorator';
import { PERMISSIONS } from 'src/lib/permissions';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get('all')
  @Permissions(PERMISSIONS.CAN_MANAGE_POSITIONS)
  async getAllPositions() {
    return this.positionsService.getAllPositions();
  }

  @Get('transaction-history')
  async getTransactionHistory(@ActiveUser() currentUser: ActiveUserInterface) {
    return this.positionsService.getTransactionHistory(currentUser?.userId);
  }

  @Post('buy')
  async buyStock(
    @ActiveUser() user: ActiveUserInterface,
    @Body() createPositionDto: CreatePositionDto,
  ) {
    return await this.positionsService.createBuyOrder(user, createPositionDto);
  }

  @Get('my-assets')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getMyAssets(@ActiveUser() user: ActiveUserInterface) {
    return await this.positionsService.getMyAssets(user?.userId);
  }

  @Post('cancel')
  async cancelWaitingOrder(
    @ActiveUser() user: ActiveUserInterface,
    @Body() body: { positionId: string },
  ) {
    return await this.positionsService.cancelWaitingOrder(
      user,
      body?.positionId,
    );
  }

  @Post('sell')
  async sell(
    @ActiveUser() user: ActiveUserInterface,
    @Body() sellPositionDto: SellPositionDto,
  ) {
    return this.positionsService.sellPosition(
      user,
      sellPositionDto.positionId,
      sellPositionDto.lotsToSell,
    );
  }

  @Get('user/:userId')
  @Permissions(PERMISSIONS.CAN_MANAGE_POSITIONS)
  async getUserPositions(@Param('userId') userId: string) {
    return this.positionsService.getUserPositions(userId);
  }

  @Patch(':positionId/user/:userId')
  @Permissions(PERMISSIONS.CAN_MANAGE_POSITIONS)
  async editUserPositionDto(
    @Param('userId') userId: string,
    @Param('positionId') positionId: string,
    @Body() editUserPositionDto: EditUserPositionDto,
  ) {
    return this.positionsService.editUserPosition(
      userId,
      positionId,
      editUserPositionDto,
    );
  }

  @Delete(':userId/:positionId')
  deletePosition(
    @Param('userId') userId: string,
    @Param('positionId') positionId: string,
  ) {
    return this.positionsService.deletePosition(userId, positionId);
  }
}
