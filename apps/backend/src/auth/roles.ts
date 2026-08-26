import { registerEnumType } from '@nestjs/graphql';
import { UserRole } from '../../generated/prisma';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Assurance platform access role',
});

export { UserRole };
