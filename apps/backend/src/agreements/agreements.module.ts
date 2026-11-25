import { Module } from '@nestjs/common';
import { AgreementsResolver } from './agreements.resolver';
import { AgreementsService } from './agreements.service';
import { QuoteSimulatorService } from './quote-simulator.service';

@Module({
  providers: [AgreementsResolver, AgreementsService, QuoteSimulatorService],
})
export class AgreementsModule {}
