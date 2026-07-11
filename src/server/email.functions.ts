import { createServerFn } from '@tanstack/react-start';

import { VerificationCode } from '@/components/blocks/email/verification-code';
import { getEmailService } from '@/services/email.server';

export const sendEmailFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { emails: string[]; subject: string }) => data)
  .handler(async ({ data }) => {
    const { emails, subject } = data;
    const emailService = await getEmailService();
    const result = await emailService.sendEmail({
      to: emails,
      subject,
      react: VerificationCode({ code: '123455' }),
    });
    return result;
  });
