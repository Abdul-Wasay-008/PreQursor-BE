import { Controller, Post, UseGuards, Body, Request } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard'; 
import { IdTeamsService } from './id-temas.service';
import { CreateGameIdDto } from './dtos/game-id.dto';

@Controller('idteams')
export class IdTeamsController {
   constructor(private idTeamsService: IdTeamsService) {}

   @UseGuards(JwtGuard) 
   @Post('add-game-id')
   async addGameId(@Body() createGameIdDto: CreateGameIdDto, @Request() req) {
       return this.idTeamsService.IdTeams(req.user._id, createGameIdDto);
   }
}
