import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { User, UserDocument, UserSchema } from './user.schema';
import { InjectModel, ModelDefinition } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createHash, HashOptions } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import AuthFailedException from '../common/errors/AuthFailedException';
import { SessionHash, SessionHashDocument } from './session-hash.schema';
import { JwtPayload } from '../common/strategies';
import { ConfigService } from '@nestjs/config';

export interface SignUpResponse {
    email: string;
    firstname: string;
    lastname: string;
    birthDate: string;
    createdAt: string;
    accessToken: string;
    refreshToken: string;
}

export interface SignInResponse {
    firstname: string;
    lastname: string;
    email: string;
    birthDate: string;
    createdAt: string;
    accessToken: string;
    refreshToken: string;
}

const hash = (str: string): string => createHash("sha256").update(str).digest("base64");

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(SessionHash.name) private sessionHashModel: Model<SessionHashDocument>,
        private jwtService: JwtService,
        private configService: ConfigService,
        ) {}
        
        async signUp(signUpDto: {
            email:string, 
            password: string,
            firstname:string, 
            lastname:string, 
            birthDate:string
    }, userInfo: {
        ip: string,
        userAgent: string,
        location: string
    }): Promise<SignUpResponse> {
        const user:UserDocument = new this.userModel(signUpDto);
        user.password = hash(user.password);
        await user.save();
        
        const tokens = await this.getTokens({
            userID: user.id, ...userInfo
        });
        
        const { email, firstname, lastname, birthDate } = signUpDto;
        const { createdAt } = user;
        
        this.addSessionHash(user.id, tokens.refreshToken, tokens.accessToken, {
            userID: user.id,
            ...userInfo
        });
        return {
            email, firstname, lastname, birthDate, createdAt,
            ...tokens
        }
    }
    
    
    async validateUser(email: string, password: string): Promise<UserDocument> {
        // Check if the email exists in the database
        const user: UserDocument = await this.userModel.findOne({ email });
        const hashedPassword = hash(password);
        
        if (!user || (user.password !== hashedPassword)) 
            throw new AuthFailedException("Email / password pair not found");

            return user;
        }
        
        
        
        async signIn(user: UserDocument, payload: JwtPayload) {
            const { email, firstname, lastname, birthDate, createdAt } = user;
            
            const tokens = await this.getTokens(payload);
            this.addSessionHash(user.id, tokens.refreshToken, tokens.accessToken, payload);
            
            return {
                email, firstname, lastname, birthDate, createdAt,
                ...tokens
            }
    }

    
    async logout(at: string) {
        await this.deleteSessionHash(at);
    }
    
    async killAllSessions(userID: string) {
        await this.deleteAllSessionHashes(userID);
    }
    
    async refreshTokens(rt: string, payload: JwtPayload & {exp: string}) {
        const hashRt = hash(rt);
        const session: SessionHashDocument = await this.sessionHashModel.findOne({hashRt});
        
        if (!session)
            throw new HttpException("RT is invalid", 400)

        const tokens = await this.getTokens(payload);

        session.hashAt = hash(tokens.accessToken);
        session.hashRt = hash(tokens.refreshToken);
        
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + 7);
        session.expiresAt = expDate;

        await session.save();
        
        return tokens;
    }
    
    async profile(userID: string) {
        const userDoc = await this.userModel.findOne({ _id: userID});
        const user = {
            firstname: userDoc.firstname,
            lastname: userDoc.lastname,
            email: userDoc.email,
            birthDate: userDoc.birthDate,
            createdAt: userDoc.createdAt
        }
        
        const sessions = await this.sessionHashModel.find({ user: userID });
        
        return {
            ...user,
            activeSessions: [
                ...sessions
            ]
        }
    }

    async killSession(userID: string, sessionId: string) {
        await this.sessionHashModel.deleteOne({ user: userID, _id: sessionId });
    }

    async addSessionHash (userID: string, rt: string, at: string, payload: JwtPayload) {
        const hashRt = hash(rt);
        const hashAt = hash(at);
        const user = this.userModel.findOne({ _id: userID });
        if (!user) throw new ForbiddenException("User for which to generate RT hash not found");
        
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + 7);
        
        const session = new this.sessionHashModel({
            ip: payload.ip,
            userAgent: payload.userAgent,
            location: payload.location,
            hashRt,
            hashAt,
            user: userID,
            expiresAt: expDate
        });
        await session.save();
    }

    async populateUsers(userIDs: string[], fields: string[]): Promise<any[]> {
        const conditions = userIDs.map(id => ({id}))

        const users = await this.userModel.find().where().or(conditions);

        users.forEach(user => Object.keys(user).forEach(key => { 
                                            if (fields.includes(key)) delete user[key];
                                        }));
        return users;
    }

    async getTokens(payload: JwtPayload & {exp?: string, iat?: number}) {
        delete payload.exp;
        delete payload.iat;

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>("JWT_AT_SECRET"),
                expiresIn: 60 * 15
            }),
            
            this.jwtService.signAsync(payload, {
                secret: this.configService.get<string>("JWT_RT_SECRET"),
                expiresIn: 60 * 60 * 24 * 7
            })
        ]);
        
        return {
            accessToken,
            refreshToken
        }
    }
    
    async deleteSessionHash (at: string) {
        const hashAt = hash(at);
        await this.sessionHashModel.deleteOne({ hashAt });
    }

    async deleteAllSessionHashes (userID: string) {
        await this.sessionHashModel.deleteMany({user: userID});
    }
}
