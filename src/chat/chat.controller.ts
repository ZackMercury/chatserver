import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { UserID } from '../common/decorators/UserID.decorator';
import { AtGuard } from '../common/guards';
import { ChatService } from './chat.service';
import { OfferPopulated } from './entities/offer.entity';
import { RoomID } from './entities/room.entity';


@Controller('chat')
export class ChatController {
    constructor (private chatService: ChatService) {}

    @UseGuards(AtGuard)
    @HttpCode(HttpStatus.OK)
    @Post("createRoom")
    createRoom (): RoomID {
        return this.chatService.createRoom();
    }

    @UseGuards(AtGuard)
    @HttpCode(HttpStatus.OK)
    @Post("joinRoom/:id")
    joinRoom(@Param("id")    roomID: string,
             @Body("offer")  offer: string,
             @UserID()       userID: string): Promise<OfferPopulated> {
        return this.chatService.joinRoom(userID, offer, roomID)
    }


    @UseGuards(AtGuard)
    @HttpCode(HttpStatus.OK)
    @Get("getOffer/:id")
    async getOffer(@Param("id")  roomID: string): Promise<OfferPopulated> {
        return this.chatService.getOffer(roomID);
    }

    @UseGuards(AtGuard)
    @HttpCode(HttpStatus.OK)
    @Get("getAnswer/:id")
    async getAnswer(@Param("id")  roomID: string): Promise<OfferPopulated> {
        return this.chatService.getAnswer(roomID);
    }
}
