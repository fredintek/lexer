import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { PositionsService } from './providers/positions.service';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import {
  CreatePositionDto,
  EditUserPositionDto,
  SellPositionDto,
} from './dtos';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get('all')
  async getAllPositions() {
    return this.positionsService.getAllPositions();
  }

  @Post('buy')
  async buyStock(
    @ActiveUser() user: ActiveUserInterface,
    @Body() createPositionDto: CreatePositionDto,
  ) {
    return await this.positionsService.createBuyOrder(user, createPositionDto);
  }

  @Get('my-assets')
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
  async getUserPositions(@Param('userId') userId: string) {
    return this.positionsService.getUserPositions(userId);
  }

  @Patch(':positionId/user/:userId')
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
}
