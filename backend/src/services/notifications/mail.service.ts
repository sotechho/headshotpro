import { config } from '@/config';
import logger from '@/utils/logger';
import { templateEngine } from '@/utils/templateEngine';
import fs from 'fs/promises';
import nodemailer, { type SendMailOptions, type Transporter } from 'nodemailer';
import path from 'path';

export class MailService {
  private transporter: Transporter | null = null;

  constructor() {
    this.initializeMailer();
  }

  private initializeMailer(): void {
    const { host, port, secure, user, password, debug } = config.smtp;
    if (user && password) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port: port,
          secure: secure,
          auth: { user, pass: password },
          pool: true,
          logger: config.smtp.logger,
          debug,
        });

        this.transporter.verify(function (error, success): void {
          if (error) {
            logger.error('SMTP connection failed', {
              error: error.message,
              code: (error as any).code,
            });
          } else {
            logger.info('SMTP connection established');
          }
        });
      } catch (error) {
        logger.error('SMTP configuration error', error);
      }
    } else {
      logger.warn('SMTP credentials not configured yet!');
    }
  }

  private checkMailConfig(): boolean {
    if (!this.transporter) {
      logger.error('SMTP not initialized yet!', { service: 'Mail Service' });
      return false;
    }
    return true;
  }

  private async wrapInLayout(content: string): Promise<string> {
    const layoutPath = path.join(
      process.cwd(),
      'src',
      'templates',
      'emails',
      'layout',
      'base.html',
    );

    const layout = await fs.readFile(layoutPath, 'utf-8');
    return layout.replace('{{content}}', content);
  }

  // send template email
  private async sendTemplateMail(
    to: string,
    subject: string,
    templateName: string,
    data: Record<string, any>,
  ): Promise<void> {
    try {
      // check transporter
      if (!this.checkMailConfig()) return;

      logger.info(`Sending email ${to} ${subject} ${templateName}`);

      const htmlContent = await templateEngine.render(
        templateName,
        data,
        '.html',
      );
      const text = await templateEngine.render(templateName, data, '.txt');
      const html = await this.wrapInLayout(htmlContent);

      logger.info('Rendered content', {
        text,
        html,
      });

      const mailOptions: SendMailOptions = {
        from: `Headshot Pro <${config.smtp.from}>`,
        to,
        subject,
        text,
        html,
      };

      logger.info('Sending email options', mailOptions);

      const result = await this.transporter!.sendMail(mailOptions);

      if (result.rejected && result.rejected.length > 0) {
        logger.warn('Email Rejected', {
          to,
          subject,
          rejected: result.rejected,
          response: result.response,
        });
      }
      logger.info('Sender email result', result);
    } catch (error: any) {
      throw error;
    }
  }

  async sendVerificationMail(
    email: string,
    name: string,
    verificationToken: string,
  ): Promise<void> {
    const data = {
      name,
      verificationUrl: `${config.frontendUrl}/verify-email?token=${verificationToken}`,
    };

    logger.info('Verification email data', data);
    await this.sendTemplateMail(
      email,
      'Verify Your Email',
      'verification',
      data,
    );
  }

  async sendPaymentSuccessMail(
    email: string,
    name: string,
    orderId: string,
    amount: number,
    credits: number,
    newBalance: number,
  ): Promise<void> {
    const data = {
      name,
      orderId,
      amount,
      credits,
      newBalance,
      dashboardUrl: `${config.frontendUrl}/dashboard/user/credits`,
    };

    logger.info('Payment success email data', data);
    await this.sendTemplateMail(
      email,
      'Payment Successful!',
      'payment-success',
      data,
    );
  }
}

export const mailService = new MailService();
