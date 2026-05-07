import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from 'src/lib/constants';
import { ActiveUserInterface } from 'src/lib/types';

export const ActiveUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ActiveUserInterface => {
    const request = ctx.switchToHttp().getRequest();
    const userObj = request[REQUEST_USER_KEY];
    return {
      email: userObj?.email,
      userId: userObj?.id,
      avatar: userObj?.avatar,
      loginHistoryId: userObj?.loginHistoryId
    };
  },
);
