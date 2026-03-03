import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.split(' ')[1]; // Extract token from the Authorization header

        if (!token) {
            throw new UnauthorizedException('JWT token not found');
        }

        try {
            const user = this.jwtService.verify(token); // Verify token
            request.user = user; // Attach user data to the request
        } catch (error) {
            throw new UnauthorizedException('Invalid JWT token');
        }

        return true; // Allow the request to proceed
    }
}
