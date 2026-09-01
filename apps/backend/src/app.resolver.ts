import { Query, Resolver } from '@nestjs/graphql';
import { Public } from './auth/public.decorator';
import { AppService } from './app.service';
import { AppInfo } from './app.types';

@Resolver(() => AppInfo)
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Query(() => AppInfo, { name: 'appInfo' })
  appInfo(): AppInfo {
    return this.appService.getInfo();
  }
}
