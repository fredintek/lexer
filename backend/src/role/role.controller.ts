import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { RoleService } from './providers/role.service';
import { UpdateRoleDto } from './dtos';
import { Permissions } from 'src/auth/decorators/auth.decorator';
import { PERMISSIONS } from 'src/lib/permissions';

@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async findAll() {
    return this.roleService.findAll();
  }

  @Get('permissions')
  async findAllPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Post()
  @Permissions(PERMISSIONS.CAN_MANAGE_ROLES)
  async create(@Body() createRoleDto: any) {
    return this.roleService.create(createRoleDto);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CAN_MANAGE_ROLES)
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(id, updateRoleDto);
  }
}
