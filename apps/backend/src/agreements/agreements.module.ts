import { Module } from '@nestjs/common';
import { AgreementsResolver } from './agreements.resolver';
import { AgreementsService } from './agreements.service';

@Module({
  providers: [AgreementsResolver, AgreementsService],
})
export class AgreementsModule {}
