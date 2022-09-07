import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const UserID = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const req = ctx.switchToHttp().getRequest();
        return req.user.userID;
    }
);