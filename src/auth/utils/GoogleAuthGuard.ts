// import { ExecutionContext, Injectable } from "@nestjs/common";
// import { AuthGuard } from "@nestjs/passport";

// @Injectable()
// export class GoogleAuthGuard extends AuthGuard('google') {
//     async canActivate(context: ExecutionContext) {
//         const activate = (await super.canActivate(context)) as boolean;
//         const request = context.switchToHttp().getRequest();
//         await super.logIn(request);
//         return activate;
//     }
// }
import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const activate = (await super.canActivate(context)) as boolean;

        if (!activate) {
            return false; // If authenticaiton gets failed
        }

        return activate; // If authentication gets successful
    }
}

