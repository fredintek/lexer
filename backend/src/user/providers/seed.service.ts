import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Role } from '../../role/entities/roles.entity';
import { SYSTEM_ROLES } from 'src/lib/constants';
import { PERMISSIONS } from 'src/lib/permissions';
import { User, UserStatus } from '../entities/user.entity';
import { HashingProvider } from 'src/auth/providers/hashing.provider';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashingProvider: HashingProvider,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  async onApplicationBootstrap() {
    await this.seedRoles();
    await this.seedSuperAdmin();
  }

  private async seedRoles() {
    const roleDefinitions = [
      {
        name: SYSTEM_ROLES.SUPERADMIN,
        description: 'System owner with full access',
        permissions: ['*'],
      },
      {
        name: SYSTEM_ROLES.TRADER,
        description: 'Standard trading account for lexer traders',
        permissions: [PERMISSIONS.CAN_TRADE, PERMISSIONS.CAN_WITHDRAW],
      },
    ];

    for (const def of roleDefinitions) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: def.name },
      });

      if (existingRole) {
        existingRole.description = def.description;
        existingRole.permissions = def.permissions;
        await this.roleRepository.save(existingRole);
      } else {
        const newRole = this.roleRepository.create(def);
        await this.roleRepository.save(newRole);
      }
    }

    console.log('✅ Roles and Permissions synchronized successfully');
  }

  private async seedSuperAdmin() {
    const adminEmails = [
      { email: 'fredintek@gmail.com', name: 'Alfred Arinze' },
      {
        email: 'bora.netafinc@gmail.com',
        name: 'borsa saykan',
      },
    ];

    // 1. Fetch the Superadmin Role first
    const adminRole = await this.roleRepository.findOne({
      where: { name: SYSTEM_ROLES.SUPERADMIN },
    });

    if (!adminRole) {
      console.error(
        '❌ Superadmin role not found in database. Skipping admin seed.',
      );
      return;
    }

    // 2. Use a transaction to ensure all-or-nothing creation
    await this.dataSource.transaction(async (manager) => {
      for (const user of adminEmails) {
        // Check if this specific admin already exists
        const existingAdmin = await manager.findOne(User, {
          where: { email: user?.email },
        });

        if (existingAdmin) {
          // console.log(`ℹ️ Admin ${email} already exists. skipping...`);
          continue;
        }

        // 3. Generate Unique Tag for this admin
        const tag = `@LX-ADMIN-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        // 4. Hash Password (using your HashingProvider)
        const rawPassword = 'LexerAdmin123';
        const hashedPassword =
          await this.hashingProvider.hashPassword(rawPassword);

        // 5. Create and Save the Admin
        const admin = manager.create(User, {
          fullname: user?.name,
          email: user?.email,
          tag: tag,
          password: hashedPassword,
          status: UserStatus.ACTIVE,
          role: adminRole,
          isWelcomeEmailSent: true,
          balance: 0,
          frozenBalance: 0,
        });

        await manager.save(User, admin);
        console.log(`👑 Superadmin [${tag}] created for: ${user?.name}`);
      }
    });
  }
}
