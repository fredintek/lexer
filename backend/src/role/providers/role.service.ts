import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities/roles.entity';
import { Repository } from 'typeorm';
import { PERMISSIONS } from 'src/lib/permissions';
import { CreateRoleDto, UpdateRoleDto } from '../dtos';

@Injectable()
export class RoleService {
    constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    ) {}

    public async findAll() {
    return this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.users', 'users')
        .orderBy(`CASE WHEN role.name = 'superadmin' THEN 0 ELSE 1 END`, 'ASC')
        .addOrderBy('role.name', 'ASC')
        .getMany();
    }

    public async findAllPermissions() {
        return Object.entries(PERMISSIONS).map(([key, slug]) => {
            const [moduleName, action] = slug.split(':');
            return {
                id: slug,
                slug: slug,
                module: moduleName.toUpperCase(),
                description: key.replace(/_/g, ' ').replace('CAN ', ''),
            };
        }).sort((a, b) => a.module.localeCompare(b.module));
    }

    public async updateRole(roleId: string, updateRoleDto: UpdateRoleDto) {
        // 1. If name is being updated, check for conflicts
        if (updateRoleDto.name) {
            const existingRole = await this.roleRepository.findOne({
                where: { name: updateRoleDto.name.toUpperCase() },
            });
        
            // If a role with that name exists and it's NOT the role we are currently editing
            if (existingRole && existingRole.id !== roleId) {
                throw new ConflictException(`Role with name "${updateRoleDto.name}" already exists`);
            }
            updateRoleDto.name = updateRoleDto.name.toUpperCase();
        }

        // 2. Preload the entity with new values
        const role = await this.roleRepository.preload({
            id: roleId,
            ...updateRoleDto,
        });

        if (!role) {
            throw new NotFoundException(`Role with ID ${roleId} not found`);
        }

        // 3. Save the merged entity
        return await this.roleRepository.save(role);
    }

    public async create(createRoleDto: CreateRoleDto): Promise<Role> {
        const { name } = createRoleDto;

        // 1. Check for duplicate role names (case-insensitive)
        const existingRole = await this.roleRepository.findOne({
            where: { name: name.toUpperCase() },
        });

        if (existingRole) {
            throw new ConflictException(`Role with name "${name}" already exists`);
        }

        // 2. Create the new role instance
        const newRole = this.roleRepository.create({
            ...createRoleDto,
            name: name.toUpperCase(), // Standardize role names to uppercase
        });

        // 3. Save to database
        return await this.roleRepository.save(newRole);
    }
}
