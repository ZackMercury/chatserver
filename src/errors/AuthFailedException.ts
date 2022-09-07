import { HttpException, HttpStatus } from "@nestjs/common";

export default class AuthFailedException extends HttpException {
    constructor(msg: string = "") {
        super("Authentication failed" + (msg ? ": " + msg : ""), HttpStatus.FORBIDDEN);
    }
}