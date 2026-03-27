import { useState, useEffect, useCallback } from 'react';
import emailService, { EmailNotification, EmailTemplate } from '../services/emailService';

interface UseEmailNotificationsReturn {
  emails: EmailNotification[];
  loading: boolean;
  error: string | null;
  sendEmail: (notification: Partial<EmailNotification>) => Promise<void>;
  sendTemplateEmail: (template: EmailTemplate) => Promise<void>;
  resendEmail: (emailId: string) => Promise<void>;
  sendBulkEmails: (emails: Partial<EmailNotification>[]) => Promise<void>;
  refreshEmails: () => Promise<void>;
  templates: any[];
}

export const useEmailNotifications = (): UseEmailNotificationsReturn => {
  const [emails, setEmails] = useState<EmailNotification[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshEmails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await emailService.getEmailHistory();
      setEmails(response.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch emails');
    } finally {
      setLoading(false);
    }
  }, []);

  const sendEmail = useCallback(async (notification: Partial<EmailNotification>) => {
    try {
      setLoading(true);
      setError(null);
      await emailService.sendEmail(notification);
      await refreshEmails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshEmails]);

  const sendTemplateEmail = useCallback(async (template: EmailTemplate) => {
    try {
      setLoading(true);
      setError(null);
      await emailService.sendTemplateEmail(template);
      await refreshEmails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send template email');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshEmails]);

  const resendEmail = useCallback(async (emailId: string) => {
    try {
      setLoading(true);
      setError(null);
      await emailService.resendEmail(emailId);
      await refreshEmails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend email');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshEmails]);

  const sendBulkEmails = useCallback(async (emails: Partial<EmailNotification>[]) => {
    try {
      setLoading(true);
      setError(null);
      await emailService.sendBulkEmails(emails);
      await refreshEmails();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send bulk emails');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshEmails]);

  useEffect(() => {
    refreshEmails();
    emailService.getEmailTemplates().then(response => {
      setTemplates(response.data || []);
    }).catch(err => {
      console.error('Failed to fetch templates:', err);
    });
  }, [refreshEmails]);

  return {
    emails,
    loading,
    error,
    sendEmail,
    sendTemplateEmail,
    resendEmail,
    sendBulkEmails,
    refreshEmails,
    templates
  };
};

export default useEmailNotifications;
