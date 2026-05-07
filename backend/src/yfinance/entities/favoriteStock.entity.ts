import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { Stocks } from './stocks.entity';

@Entity()
@Unique(['user', 'stock'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Stocks, { onDelete: 'CASCADE' })
  stock!: Stocks;
}
