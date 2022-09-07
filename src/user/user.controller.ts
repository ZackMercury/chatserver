import { Controller, Get, Post, HttpStatus, HttpCode, Body, UseGuards, Req, Request, Delete, Patch} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { Payload } from '../common/decorators/Payload.decorator';
import { Token } from '../common/decorators/Token.decorator';
import { UserID } from '../common/decorators/UserID.decorator';
import { AtGuard, RtGuard } from '../guards';
import { JwtPayload } from '../strategies';
import { SignInResponse, SignUpResponse, UserService } from './user.service';
import * as geoip from 'geoip-lite';


@Controller('user')
export class UserController {
    constructor(private userService: UserService){}

    @Post('signup')
    @HttpCode(HttpStatus.OK)
    async signUp(
        @Body("firstname")  firstname: string, 
        @Body("lastname")   lastname: string, 
        @Body("email")      email: string,
        @Body("password")   password: string,
        @Body("birthDate")  birthDate: string,
        @Request()          req: ExpressRequest,
    ): Promise<SignUpResponse> {

        const ip = req.ip;
        const userAgent = req.get("User-Agent");
        const geoInfo = geoip.lookup(ip);

        let location;

        if (geoInfo)
            location = `${geoInfo.city}, ${geoInfo.region}, ${geoInfo.country}`;
        else
            location = "localhost";

        return await this.userService.signUp({
            firstname,
            password,
            lastname,
            email,
            birthDate
        }, {
            ip,
            userAgent,
            location
        });
    }

    @Post('signin')
    @HttpCode(HttpStatus.OK)
    async signIn(
        @Body("email")      email: string,
        @Body("password")   password: string,
        @Request()          req: ExpressRequest,
    ): Promise<SignInResponse> {

        const user = await this.userService.validateUser(email, password);
        const ip = req.ip;
        const userAgent = req.get("User-Agent");
        const geoInfo = geoip.lookup(ip);
        
        let location: string;
        if (geoInfo)
            location = `${geoInfo.city}, ${geoInfo.region}, ${geoInfo.country}`;
        else
            location = "localhost";

        // Populate the payload
        const payload: JwtPayload = {
            userID: user.id,
            ip,
            userAgent,
            location
        };
        const jwt = this.userService.signIn(user, payload);
        return jwt;
    }

    @UseGuards(AtGuard)
    @Delete("logout")
    @HttpCode(HttpStatus.OK)
    async logout(@Token() at: string) {
        return this.userService.logout(at);
    }

    @UseGuards(AtGuard)
    @Delete("killsession")
    @HttpCode(HttpStatus.OK)
    async killSession(@Body("sessionRt") sessionRt: string,
                      @UserID()          userID: string) {
        return this.userService.killSession(userID, sessionRt);
    }

    @UseGuards(AtGuard)
    @Delete("killallsessions")
    @HttpCode(HttpStatus.OK)
    async killAllSessions(@UserID() userID: string) {
        this.userService.killAllSessions(userID);
    }

    @UseGuards(RtGuard)
    @Patch("refresh")
    @HttpCode(HttpStatus.OK)
    async refreshTokens (@Token()   rt: string,
                         @Payload() payload: JwtPayload) {
        return this.userService.refreshTokens(rt, payload);
    }

    @UseGuards(AuthGuard("at"))
    @Get("profile")
    @HttpCode(HttpStatus.OK)
    async getProfile(@UserID() userID) {
        return this.userService.profile(userID);
    }
}
