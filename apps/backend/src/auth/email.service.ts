import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { appendFile } from 'node:fs/promises';
import { join } from 'node:path';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  get webUrl() {
    return this.config.get<string>('APP_WEB_URL') ?? 'http://localhost:5173';
  }

  get exposeDevLinks() {
    return !this.config.get<string>('SMTP_HOST');
  }

  async send(options: { to: string; subject: string; text: string; link: string }) {
    const entry = [
      new Date().toISOString(),
      `To: ${options.to}`,
      `Subject: ${options.subject}`,
      options.text,
      options.link,
      '---',
      '',
    ].join('\n');

    this.logger.log(`Queued email to ${options.to}: ${options.subject}`);
    await appendFile(join(process.cwd(), '.local-email-outbox'), entry, 'utf8');

    return this.exposeDevLinks ? options.link : null;
  }
}
