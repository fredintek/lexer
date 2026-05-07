import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentMethod } from '../entities/payment.entity';
import { Repository } from 'typeorm';
import { CreatePaymentMethodDto } from '../dtos/payment.dto';
import { ActiveUserInterface } from 'src/lib/types';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class PaymentService {
    constructor(
    @InjectRepository(PaymentMethod)
    private readonly paymentMethodRepo: Repository<PaymentMethod>,

    private readonly eventEmitter: EventEmitter2
  ) {}

  public async findAll(currentUser: ActiveUserInterface) {
    return this.paymentMethodRepo.find({ where: { user: { id: currentUser?.userId } }, order: { isDefault: 'DESC' } });
  }

  public async create(currentUser: ActiveUserInterface, createPaymentMethodDto: CreatePaymentMethodDto) {
    const count = await this.paymentMethodRepo.count({ where: { user: { id: currentUser?.userId } } });
    
    const method = this.paymentMethodRepo.create({
      ...createPaymentMethodDto,
      user: { id: currentUser?.userId },
      isDefault: count === 0,
    });
    await this.paymentMethodRepo.save(method);

    // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
        userId: currentUser?.userId,
        type: "PROFILE",
        description: 'Added new payment method',
    });
    
    return { success: true };
  }

  public async setPrimary(currentUser: ActiveUserInterface, methodId: string) {
    // Set all to false first
    await this.paymentMethodRepo.update({ user: { id: currentUser?.userId } }, { isDefault: false });
    // Set selected to true
    await this.paymentMethodRepo.update({ id: methodId, user: { id: currentUser?.userId } }, { isDefault: true });

     // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
        userId: currentUser?.userId,
        type: "PROFILE",
        description: 'Switched primary payment method',
    });
    return { success: true };
  }

  public async remove(currentUser: ActiveUserInterface, methodId: string) {
    const method = await this.paymentMethodRepo.findOne({ where: { id: methodId, user: { id: currentUser?.userId } } });
    if (method?.isDefault) {
      throw new BadRequestException("Cannot delete primary method. Set another as primary first.");
    }
    await this.paymentMethodRepo.delete({ id: methodId });
     // Emit the event (This is non-blocking!)
    this.eventEmitter.emit('user.activity', {
        userId: currentUser?.userId,
        type: "PROFILE",
        description: 'Deleted payment method',
    });
    return { success: true };
  }
}
