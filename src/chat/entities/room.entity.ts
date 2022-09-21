import { HttpException } from '@nestjs/common';
import { EventEmitter } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { Offer } from './offer.entity';

export type RoomID = string;

export enum RoomEvent {
    EXPIRED="expired"
}

export default class Room extends EventEmitter {
    public static readonly AUTODESTROY_TIME: number = 15 * 60 * 1000;

    public readonly id: RoomID;
    private offer: Offer;
    private answer: Offer;

    private destroyTimeout: NodeJS.Timeout;

    constructor () {
        super();

        this.id = uuidv4();

        this.destroyTimeout = setTimeout(this.destroy.bind(this), Room.AUTODESTROY_TIME);
    }
    
    extend(): void {
        clearTimeout(this.destroyTimeout);
        this.destroyTimeout = setTimeout(this.destroy.bind(this), Room.AUTODESTROY_TIME);
    }
    
    destroy(): void {
        this.emit(RoomEvent.EXPIRED);
        console.log("Destroying room " + this.id);
    }
    

    setOffer (offer: Offer): void {
        if (this.offer) throw new HttpException("The room already has an offer", 500);
        this.offer = offer;
    }

    setAnswer (answer: Offer): void {
        if (this.answer) throw new HttpException("Room can only have 2 members.", 500);
        this.answer = answer;
    }

    getAnswer (): Offer { return this.answer }


    getOffer (): Offer { return this.offer }
}