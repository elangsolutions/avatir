import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { createHash, randomBytes } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { AgreementStatus, AuthTokenType, UserRole } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import {
  AuthenticatedUser,
  AuthMessage,
  AuthOverview,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from './auth.types';
import { EmailService } from './email.service';

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  async onModuleInit() {
    await this.ensureDemoWorkspace();
  }

  getOverview(): AuthOverview {
    return {
      message:
        'Google sign-in is scaffolded and will be connected to OAuth credentials in the next step.',
      providers: [{ name: 'Google', enabled: false }],
    };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email.trim().toLowerCase() },
    });

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.emailVerifiedAt) {
      throw new ForbiddenException('Please verify your email before signing in.');
    }

    return this.toSession(user);
  }

  async register(input: RegisterInput): Promise<AuthMessage> {
    const user = await this.usersService.create(
      {
        name: input.name,
        email: input.email,
        password: input.password,
        role: UserRole.CLIENT,
      },
      { emailVerified: false },
    );

    const devLink = await this.sendVerificationEmail(user.id, user.email);
    return {
      message: 'Check your email to verify your account before signing in.',
      devLink,
    };
  }

  async requestPasswordReset(email: string): Promise<AuthMessage> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    let devLink: string | null = null;
    if (user) {
      const token = await this.issueToken(user.id, AuthTokenType.PASSWORD_RESET, 1);
      const link = `${this.email.webUrl}/app/reset-password?token=${encodeURIComponent(token)}`;
      devLink = await this.email.send({
        to: user.email,
        subject: 'Reset your AVATIR password',
        text: `Use this link to choose a new password. It expires in 1 hour.\n\n${link}`,
        link,
      });
    }

    return {
      message: 'If that email is registered, we sent a password reset link.',
      devLink,
    };
  }

  async resetPassword(input: ResetPasswordInput): Promise<AuthMessage> {
    const record = await this.findValidToken(input.token, AuthTokenType.PASSWORD_RESET);
    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: await bcrypt.hash(input.password, 10) },
    });
    await this.consumeToken(record.id);
    return { message: 'Your password was updated. You can sign in now.' };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.authToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });

    if (!record || record.type !== AuthTokenType.EMAIL_VERIFICATION) {
      throw new BadRequestException('This link is invalid or has expired.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) {
      throw new BadRequestException('This link is invalid or has expired.');
    }

    if (record.usedAt && user.emailVerifiedAt) {
      return this.toSession(user);
    }

    if (record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('This link is invalid or has expired.');
    }

    const verified = await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
    await this.consumeToken(record.id);
    return this.toSession(verified);
  }

  async resendVerificationEmail(email: string): Promise<AuthMessage> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || user.emailVerifiedAt) {
      return {
        message: 'If that email needs verification, we sent a new link.',
      };
    }

    const devLink = await this.sendVerificationEmail(user.id, user.email);
    return {
      message: 'If that email needs verification, we sent a new link.',
      devLink,
    };
  }

  async userFromRequest(request: {
    headers?: Record<string, string | string[] | undefined>;
  }): Promise<AuthenticatedUser | null> {
    const header = request.headers?.authorization;
    const value = Array.isArray(header) ? header[0] : header;
    if (!value?.startsWith('Bearer ')) {
      return null;
    }

    try {
      const payload = jwt.verify(value.slice(7), this.jwtSecret) as JwtPayload;
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        return null;
      }

      return this.toAuthenticatedUser(user);
    } catch {
      return null;
    }
  }

  private toSession(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      token: this.signToken(user),
      user,
    };
  }

  private toAuthenticatedUser(user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  }): AuthenticatedUser {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private signToken(user: AuthenticatedUser) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } satisfies SignOptions);
  }

  private get jwtSecret() {
    return this.config.get<string>('JWT_SECRET') ?? 'change-me-in-development';
  }

  private get jwtExpiresIn(): SignOptions['expiresIn'] {
    return (this.config.get<string>('JWT_EXPIRES_IN') ?? '7d') as SignOptions['expiresIn'];
  }

  private async ensureDemoWorkspace() {
    const passwordHash = await bcrypt.hash('password123', 10);

    await this.ensureUser({
      name: 'Alex Rivera',
      email: 'admin@avatir.com',
      role: UserRole.ADMIN,
      passwordHash,
    });

    const agent = await this.ensureUser({
      name: 'Maya Chen',
      email: 'agent@avatir.com',
      role: UserRole.AGENT,
      passwordHash,
    });

    const client = await this.ensureUser({
      name: 'Jordan Lee',
      email: 'client@avatir.com',
      role: UserRole.CLIENT,
      passwordHash,
    });

    await this.ensurePersonalAdmin();

    const agreementCount = await this.prisma.agreement.count();
    if (agreementCount > 0) {
      return;
    }

    await this.prisma.agreement.createMany({
      data: [
        {
          title: 'Primary servicing',
          clientName: client.name,
          amount: 42000,
          currency: 'USD',
          status: AgreementStatus.active,
          ownerId: client.id,
          agentId: agent.id,
          notes: 'Assigned to the demo client account.',
        },
        {
          title: 'Review cycle',
          clientName: 'Blue Peak',
          amount: 18500,
          currency: 'USD',
          status: AgreementStatus.draft,
          agentId: agent.id,
          notes: 'Internal draft visible to ADMIN and AGENT only.',
        },
      ],
    });
  }

  private async ensureUser(data: {
    name: string;
    email: string;
    role: UserRole;
    passwordHash: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      if (!existing.emailVerifiedAt || !existing.passwordHash) {
        return this.prisma.user.update({
          where: { id: existing.id },
          data: {
            passwordHash: existing.passwordHash || data.passwordHash,
            role: data.role,
            emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
          },
        });
      }

      return existing;
    }

    return this.prisma.user.create({
      data: {
        ...data,
        emailVerifiedAt: new Date(),
      },
    });
  }

  private async ensurePersonalAdmin() {
    const email = 'ericlang80@gmail.com';
    const existing = await this.prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (existing.role !== UserRole.ADMIN || existing.name !== 'Eric' || !existing.emailVerifiedAt) {
        await this.prisma.user.update({
          where: { id: existing.id },
          data: {
            name: 'Eric',
            role: UserRole.ADMIN,
            emailVerifiedAt: existing.emailVerifiedAt ?? new Date(),
          },
        });
      }
      return;
    }

    const password = randomBytes(12).toString('base64url');
    await this.prisma.user.create({
      data: {
        name: 'Eric',
        email,
        role: UserRole.ADMIN,
        passwordHash: await bcrypt.hash(password, 10),
        emailVerifiedAt: new Date(),
      },
    });
    this.logger.warn(
      `Seeded admin ${email}. Temporary password written to apps/backend/.local-admin-password`,
    );
    await writeFile(
      join(process.cwd(), '.local-admin-password'),
      `${email}\n${password}\n`,
      { encoding: 'utf8' },
    );
  }

  private async sendVerificationEmail(userId: string, email: string) {
    const token = await this.issueToken(userId, AuthTokenType.EMAIL_VERIFICATION, 24);
    const link = `${this.email.webUrl}/app/verify-email?token=${encodeURIComponent(token)}`;
    return this.email.send({
      to: email,
      subject: 'Verify your AVATIR email',
      text: `Confirm your email to activate your AVATIR account. This link expires in 24 hours.\n\n${link}`,
      link,
    });
  }

  private async issueToken(userId: string, type: AuthTokenType, hours: number) {
    await this.prisma.authToken.updateMany({
      where: { userId, type, usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = randomBytes(32).toString('base64url');
    await this.prisma.authToken.create({
      data: {
        userId,
        type,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
      },
    });
    return token;
  }

  private async findValidToken(token: string, type: AuthTokenType) {
    const record = await this.prisma.authToken.findUnique({
      where: { tokenHash: this.hashToken(token) },
    });

    if (!record || record.type !== type || record.usedAt || record.expiresAt < new Date()) {
      throw new BadRequestException('This link is invalid or has expired.');
    }

    return record;
  }

  private consumeToken(id: string) {
    return this.prisma.authToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
