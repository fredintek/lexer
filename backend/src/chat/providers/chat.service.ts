import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatRoom } from '../entities/chatRoom.entity';
import { Message } from '../entities/message.entity';
import { Repository } from 'typeorm';
import { ActiveUserInterface } from 'src/lib/types';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom) private readonly roomRepo: Repository<ChatRoom>,
    @InjectRepository(Message) private readonly msgRepo: Repository<Message>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async getOrCreateRoom(userId: string) {
    let room = await this.roomRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!room) {
      const targetUser = await this.userRepo.findOne({ where: { id: userId } });
      if (!targetUser) throw new NotFoundException('Invalid user');
      room = this.roomRepo.create({ user: targetUser });
      await this.roomRepo.save(room);
    }
    return room;
  }

  async saveMessage(
    roomId: string,
    content: string,
    isAdmin: boolean,
    senderId: string,
  ) {
    const targetRoom = await this.roomRepo.findOne({ where: { id: roomId } });
    if (!targetRoom) throw new NotFoundException('Invalid Room');
    const message = this.msgRepo.create({
      room: targetRoom,
      content,
      isAdmin,
      senderId,
    });

    await this.msgRepo.save(message);

    // Update last activity in room for sorting the Support Queue
    await this.roomRepo.update(roomId, { lastMessageAt: new Date() });
    return message;
  }

  /**
   * For the Trader: Fetch their own chat history.
   * If no room exists yet, we return an empty array.
   */
  public async getRoomHistory(currentUser: ActiveUserInterface) {
    const room = await this.roomRepo.findOne({
      where: { user: { id: currentUser.userId } },
    });

    if (!room) return [];

    return await this.getMessagesByRoom(room.id);
  }

  /**
   * For the Admin: Get all active chat rooms.
   * We include the user relation and sort by last activity.
   */
  public async findAllRooms() {
    return await this.roomRepo.find({
      relations: ['user'],
      order: {
        lastMessageAt: 'DESC',
      },
    });
  }

  /**
   * For both: Fetch all messages for a specific room.
   */
  public async getMessagesByRoom(roomId: string) {
    // Check if room exists first
    const room = await this.roomRepo.findOneBy({ id: roomId });
    if (!room) throw new NotFoundException('Chat room not found');

    return await this.msgRepo.find({
      where: { room: { id: roomId } },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Helper used by the Gateway to update room activity
   */
  public async updateRoomActivity(roomId: string) {
    return await this.roomRepo.update(roomId, {
      lastMessageAt: new Date(),
    });
  }
}
