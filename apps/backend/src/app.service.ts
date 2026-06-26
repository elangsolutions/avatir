import { Injectable } from '@nestjs/common';
import { AppInfo } from './app.types';

@Injectable()
export class AppService {
  getInfo(): AppInfo {
    return {
      name: 'AVATIR',
      tagline: 'Mobile-first assurance deal management',
      status: 'scaffolded',
    };
  }
}
