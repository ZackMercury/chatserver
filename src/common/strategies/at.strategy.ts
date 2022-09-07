import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy as JwtStrategy} from "passport-jwt";

export interface JwtPayload {
    userID: string,
    userAgent: string,
    ip: string,
    location: string,
}


@Injectable()
export class AtStrategy extends PassportStrategy(JwtStrategy, "at") {
    constructor (private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get<string>("JWT_AT_SECRET")
        });
    }

    validate (payload: JwtPayload) {
        return payload;
    }
}