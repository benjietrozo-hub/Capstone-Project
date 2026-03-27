import axiosInstance from './axios';

export interface EmailNotification {
  id: string;
  recipient_email: string;
  subject: string;
  message: string;
  type: 'notification' | 'alert' | 'report' | 'reminder';
  related_id?: number;
  related_type?: string;
  data?: any;
  sent_at?: string;
  is_sent?: boolean;
}

export interface EmailTemplate {
  type: 'item_assigned' | 'item_returned' | 'low_stock' | 'overdue' | 'system_alert';
  recipient: string;
  data: any;
}

class EmailService {
  /**
   * Send email notification
   */
  async sendEmail(notification: Partial<EmailNotification>): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/emails/send', notification);
      return response.data;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send notification using template
   */
  async sendTemplateEmail(template: EmailTemplate): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/emails/send-template', template);
      return response.data;
    } catch (error) {
      console.error('Failed to send template email:', error);
      throw error;
    }
  }

  /**
   * Get email notification history
   */
  async getEmailHistory(page: number = 1, limit: number = 20): Promise<any> {
    try {
      const response = await axiosInstance.get(`/api/emails/history?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch email history:', error);
      throw error;
    }
  }

  /**
   * Get email templates
   */
  async getEmailTemplates(): Promise<any> {
    try {
      const response = await axiosInstance.get('/api/emails/templates');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
      throw error;
    }
  }

  /**
   * Resend failed email
   */
  async resendEmail(emailId: string): Promise<any> {
    try {
      const response = await axiosInstance.post(`/api/emails/resend/${emailId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to resend email:', error);
      throw error;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(emails: Partial<EmailNotification>[]): Promise<any> {
    try {
      const response = await axiosInstance.post('/api/emails/send-bulk', { emails });
      return response.data;
    } catch (error) {
      console.error('Failed to send bulk emails:', error);
      throw error;
    }
  }
}

export default new EmailService();
