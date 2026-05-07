import { User } from "src/user/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: ['Bank Account', 'Crypto Wallet'] })
  type!: string;

  @Column()
  name!: string;

  @Column()
  detail!: string;

  @Column({ default: false })
  isDefault!: boolean;

  @ManyToOne(() => User, (user) => user.paymentMethods)
  user!: User;

  @CreateDateColumn()
  createdAt!: Date;
}