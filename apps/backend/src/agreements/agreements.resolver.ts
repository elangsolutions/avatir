import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserRole } from '../auth/roles';
import { Roles } from '../auth/roles.decorator';
import {
  Agreement,
  AgreementQuoteSimulation,
  AgreementSimulationInput,
  CreateAgreementInput,
  UpdateAgreementInput,
} from './agreements.types';
import { AgreementsService } from './agreements.service';
import { QuoteSimulatorService } from './quote-simulator.service';

@Resolver(() => Agreement)
export class AgreementsResolver {
  constructor(
    private readonly agreementsService: AgreementsService,
    private readonly quoteSimulator: QuoteSimulatorService,
  ) {}

  @Query(() => [Agreement], { name: 'agreements' })
  agreements(@CurrentUser() actor: AuthenticatedUser) {
    return this.agreementsService.findAll(actor);
  }

  @Query(() => Agreement, { name: 'agreement' })
  agreement(@Args('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.agreementsService.findOne(id, actor);
  }

  @Mutation(() => AgreementQuoteSimulation, { name: 'simulateAgreementQuotes' })
  simulateAgreementQuotes(@Args('input') input: AgreementSimulationInput) {
    return this.quoteSimulator.simulate(input);
  }

  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Mutation(() => Agreement, { name: 'createAgreement' })
  createAgreement(
    @Args('input') input: CreateAgreementInput,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.agreementsService.create(input, actor);
  }

  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Mutation(() => Agreement, { name: 'updateAgreement' })
  updateAgreement(
    @Args('id') id: string,
    @Args('input') input: UpdateAgreementInput,
    @CurrentUser() actor: AuthenticatedUser,
  ) {
    return this.agreementsService.update(id, input, actor);
  }

  @Roles(UserRole.ADMIN)
  @Mutation(() => Boolean, { name: 'deleteAgreement' })
  deleteAgreement(@Args('id') id: string, @CurrentUser() actor: AuthenticatedUser) {
    return this.agreementsService.remove(id, actor);
  }
}
