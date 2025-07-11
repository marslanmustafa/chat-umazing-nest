import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(private readonly jwtSecret: JwtService) { }

    generateToken(payload: any): string {
        return this.jwtSecret.sign(payload)
    }
}