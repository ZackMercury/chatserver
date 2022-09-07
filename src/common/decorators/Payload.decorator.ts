import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../../strategies";

export const Payload = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): JwtPayload => {
        const req = ctx.switchToHttp().getRequest();
        return req.user;
    }
);