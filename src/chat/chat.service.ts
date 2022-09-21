import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Offer, OfferPopulated } from './entities/offer.entity';
import Room, { RoomEvent, RoomID } from './entities/room.entity';

@Injectable()
export class ChatService {
    private readonly rooms:Map<RoomID, Room> = new Map<RoomID, Room>();
    
    constructor (private readonly userService: UserService) {}

    createRoom(): RoomID {
        const room = new Room();
        this.rooms.set(room.id, room);
        room.addListener(RoomEvent.EXPIRED, () => {
            room.removeAllListeners();
            this.rooms.delete(room.id)
        });
        return room.id;
    }

    async joinRoom (userID: string, offer: string, roomID: RoomID): Promise<OfferPopulated> {
        const room = this.rooms.get(roomID);
        if (!room) throw new HttpException("Room not found", 404);
        const offerPop = await this.getOffer(roomID);

        if (offerPop) {
            const roomOffer = room.getOffer();
            if (userID === roomOffer.userID)
                throw new HttpException("You are already present in the room.", HttpStatus.FORBIDDEN)
            room.setAnswer({ userID, offer });
            return offerPop;
        } else {
            room.setOffer({ userID, offer });
            return null;
        }
    }

    async getOffer (roomID: string): Promise<OfferPopulated> {
        const room = this.rooms.get(roomID);
        if (!room) throw new HttpException("Room not found", 404);
        const offer = room.getOffer();
        if (!offer) return null;
        
        const userEmails = (await this.userService.populateUsers([offer.userID], ["email"]));

        return {
            userEmail: userEmails[0].email,
            offer:     offer.offer
        };
    }

    async getAnswer (roomID: string): Promise<OfferPopulated> {
        const room = this.rooms.get(roomID);
        if (!room) throw new HttpException("Room not found", 404);
        const answer = room.getAnswer();
        if (!answer) return null;
        
        const userEmails = (await this.userService.populateUsers([answer.userID], ["email"]));

        return {
            userEmail: userEmails[0].email,
            offer:     answer.offer
        };
    }
}
