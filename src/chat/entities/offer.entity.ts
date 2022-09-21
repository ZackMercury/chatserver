export type OfferString = string;

export interface Offer {
    userID: string;
    offer: OfferString;
}

export interface OfferPopulated {
    userEmail: string;
    offer: OfferString;
}