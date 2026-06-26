import { Query, Resolver } from '@nestjs/graphql';
import { AppService } from './app.service';
import { AppInfo } from './app.types';

@Resolver(() => AppInfo)
export class AppResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => AppInfo, { name: 'appInfo' })
  appInfo(): AppInfo {
    return this.appService.getInfo();
  }
}
