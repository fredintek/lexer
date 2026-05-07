import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Message } from "./message.entity";

@Entity()
export class ChatRoom {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => User)
  @JoinColumn()
  user!: User; // The trader

  @Column({ default: 'OPEN' }) // OPEN, CLOSED
  status!: string;

  @OneToMany(() => Message, (msg) => msg.room)
  messages!: Message[];

  @UpdateDateColumn()
  lastMessageAt!: Date;
}