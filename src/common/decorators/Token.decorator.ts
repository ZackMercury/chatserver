import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const Token = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): string => {
        const req = ctx.switchToHttp().getRequest<Request>();
        return req.get("authorization").replace("Bearer", "").trim();
    }
);