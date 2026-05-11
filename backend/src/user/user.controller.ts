import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ActiveUser } from 'src/auth/decorators/activeUser.decorator';
import { ActiveUserInterface } from 'src/lib/types';
import { UserService } from './providers/user.service';
import { AvatarPipe } from './pipes/avatar.pipe';
import {
  CreateUserAdminDto,
  GetUsersQueryDto,
  UpdateUserAdminDto,
  UpdateUserProfileDto,
} from './dtos';
import { Permissions, UserStatus } from 'src/auth/decorators/auth.decorator';
import { PERMISSIONS } from 'src/lib/permissions';
import { UserStatus as UserStatusEnum } from 'src/user/entities/user.entity';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Permissions(PERMISSIONS.CAN_VIEW_USERS)
  public getUsers(
    @Query() getUsersQueryDto: GetUsersQueryDto,
    @ActiveUser() currentUser: ActiveUserInterface,
  ) {
    return this.userService.findAll(getUsersQueryDto, currentUser);
  }

  @Get('user-metrics')
  @Permissions(PERMISSIONS.CAN_VIEW_USERS)
  getMetrics() {
    return this.userService.getUserMetrics();
  }

  @Get('me')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getCurrentUser(@ActiveUser() user: ActiveUserInterface) {
    return this.userService.findById(user.userId);
  }

  @Get('me/statistics')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async getMyStatistics(@ActiveUser() user: ActiveUserInterface) {
    return this.userService.getUserStatistics(user.userId);
  }

  /**
   * AUTHENTICATION: true
   */
  @Patch('avatar')
  @UseInterceptors(FileInterceptor('file'))
  public updateAvatar(
    @ActiveUser() activeUser: ActiveUserInterface,
    @UploadedFile(new AvatarPipe()) file: Express.Multer.File,
  ) {
    return this.userService.updateAvatar(activeUser, file);
  }

  /**
   * AUTHENTICATION: true
   */
  @Patch('profile')
  public updateProfile(
    @ActiveUser() activeUser: ActiveUserInterface,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userService.updateUserProfile(activeUser, updateUserProfileDto);
  }

  @Patch('fcm-token')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async setFcmToken(
    @ActiveUser() user: ActiveUserInterface,
    @Body('token') token: string,
  ) {
    return this.userService.updateFcmToken(user.userId, token);
  }

  @Post()
  @Permissions(PERMISSIONS.CAN_EDIT_USERS)
  async createUser(@Body() createUserAdminDto: CreateUserAdminDto) {
    return this.userService.adminCreateUser(createUserAdminDto);
  }

  @Get('by-ids')
  async findByIds(@Query('ids') ids: string) {
    const idsArray = ids.split(',').filter(Boolean);
    return this.userService.getUserDetailsByIds(idsArray);
  }

  @Get(':id')
  @UserStatus(
    UserStatusEnum.ACTIVE,
    UserStatusEnum.PENDING,
    UserStatusEnum.SUSPENDED,
    UserStatusEnum.DEACTIVATED,
  )
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.userService.getUserDetails(id);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CAN_EDIT_USERS)
  async updateUser(@Param('id') id: string, @Body() dto: UpdateUserAdminDto) {
    return this.userService.adminUpdateUser(id, dto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.CAN_EDIT_USERS)
  async deleteUser(
    @Param('id') id: string,
    @ActiveUser() currentUser: ActiveUserInterface,
  ) {
    return this.userService.softDelete(id, currentUser);
  }
}
