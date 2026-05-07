// bank-accounts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BankAccount } from '../entities/bank-accounts.entity';
import { CreateBankAccountDto, UpdateBankAccountDto } from '../dtos';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ActiveUserInterface } from 'src/lib/types';

@Injectable()
export class BankAccountsService {
  constructor(
    @InjectRepository(BankAccount)
    private repo: Repository<BankAccount>,

    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  public async create(
    createBankAccountDto: CreateBankAccountDto,
    currentUser: ActiveUserInterface,
  ) {
    const account = this.repo.create(createBankAccountDto);
    await this.repo.save(account);

    // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
      userId: currentUser.userId,
      type: 'SYSTEM',
      description: 'Account created',
    });
    return { message: 'account created' };
  }

  public async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  public async update(
    id: string,
    updateBankAccountDto: UpdateBankAccountDto,
    currentUser: ActiveUserInterface,
  ) {
    const account = await this.repo.preload({ id, ...updateBankAccountDto });
    if (!account) throw new NotFoundException('Account not found');

    await this.repo.save(account);

    // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
      userId: currentUser.userId,
      type: 'SYSTEM',
      description: 'Account updated',
    });
    return { message: 'Account updated successfully' };
  }

  public async remove(id: string) {
    const account = await this.repo.findOneBy({ id });
    if (!account) throw new NotFoundException('Account not found');
    return this.repo.remove(account);
  }

  public async setActiveAccount(id: string): Promise<BankAccount> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const account = await queryRunner.manager.findOne(BankAccount, {
        where: { id },
      });
      if (!account) throw new NotFoundException('Account not found');

      await queryRunner.manager
        .createQueryBuilder()
        .update(BankAccount)
        .set({ isActive: false })
        .where('isActive = :active', { active: true })
        .execute();

      account.isActive = true;
      const updatedAccount = await queryRunner.manager.save(account);

      await queryRunner.commitTransaction();
      return updatedAccount;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  public async getActiveAccount() {
    const activeAccount = await this.repo.findOne({
      where: { isActive: true },
    });

    if (!activeAccount) {
      throw new NotFoundException('No active bank account found for deposits.');
    }

    return activeAccount;
  }
}
