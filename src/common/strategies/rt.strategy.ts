import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";

@Injectable()
export class RtStrategy extends PassportStrategy(JwtStrategy, "rt") {
    constructor (private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>("JWT_RT_SECRET"),
            passReqToCallback: true,
        });
    }

    validate (req: Request, payload: any) {
        return payload;
    }
}