import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Agreement, CreateAgreementInput, UpdateAgreementInput } from './agreements.types';
import { AgreementsService } from './agreements.service';

@Resolver(() => Agreement)
export class AgreementsResolver {
  constructor(private readonly agreementsService: AgreementsService) {}

  @Query(() => [Agreement], { name: 'agreements' })
  agreements() {
    return this.agreementsService.findAll();
  }

  @Query(() => Agreement, { name: 'agreement' })
  agreement(@Args('id') id: string) {
    return this.agreementsService.findOne(id);
  }

  @Mutation(() => Agreement, { name: 'createAgreement' })
  createAgreement(@Args('input') input: CreateAgreementInput) {
    return this.agreementsService.create(input);
  }

  @Mutation(() => Agreement, { name: 'updateAgreement' })
  updateAgreement(
    @Args('id') id: string,
    @Args('input') input: UpdateAgreementInput,
  ) {
    return this.agreementsService.update(id, input);
  }

  @Mutation(() => Boolean, { name: 'deleteAgreement' })
  deleteAgreement(@Args('id') id: string) {
    return this.agreementsService.remove(id);
  }
}
