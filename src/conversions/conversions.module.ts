import { Module } from '@nestjs/common';
import { ConversionsService } from './conversions.service';

@Module({
  providers: [ConversionsService],
  exports: [ConversionsService], // Exporting so it can be used in other modules
})
export class ConversionsModule {}
