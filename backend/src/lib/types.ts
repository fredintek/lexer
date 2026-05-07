import { IAvatar } from "src/user/entities/user.entity";

export interface ActiveUserInterface {
  userId: string;
  email: string;
  avatar?: IAvatar | null;
  loginHistoryId?: string;
}
