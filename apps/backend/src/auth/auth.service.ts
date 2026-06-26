import { Injectable } from '@nestjs/common';
import { AuthOverview } from './auth.types';

@Injectable()
export class AuthService {
  getOverview(): AuthOverview {
    return {
      message:
        'Google sign-in is scaffolded and will be connected to OAuth credentials in the next step.',
      providers: [{ name: 'Google', enabled: false }],
    };
  }
}
