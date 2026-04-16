import React, { useState } from 'react';
import { Mail, Send, Users, FileText, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import useEmailNotifications from '../hooks/useEmailNotifications';
import { EmailNotification, EmailTemplate } from '../services/emailService';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail?: string;
  defaultType?: 'notification' | 'alert' | 'report' | 'reminder';
}

const EmailNotificationModal: React.FC<EmailNotificationModalProps> = ({
  isOpen,
  onClose,
  recipientEmail = '',
  defaultType = 'notification'
}) => {
  const {
    sendEmail,
    sendTemplateEmail,
    sendBulkEmails,
    loading,
    error
  } = useEmailNotifications();

  const [formData, setFormData] = useState<{
    recipient_email: string;
    subject: string;
    message: string;
    type: 'notification' | 'alert' | 'report' | 'reminder';
    related_id?: number;
    related_type: string;
  }>({
    recipient_email: recipientEmail,
    subject: '',
    message: '',
    type: defaultType,
    related_id: undefined,
    related_type: ''
  });

  const [templateData, setTemplateData] = useState({
    type: 'item_assigned' as const,
    recipient: recipientEmail,
    data: {}
  });

  const [activeTab, setActiveTab] = useState<'custom' | 'template' | 'bulk'>('custom');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'custom') {
        await sendEmail(formData);
      } else if (activeTab === 'template') {
        await sendTemplateEmail(templateData);
      }
      onClose();
      // Reset form - preserve recipient email
      setFormData({
        recipient_email: formData.recipient_email || recipientEmail || '',
        subject: '',
        message: '',
        type: defaultType,
        related_id: undefined,
        related_type: ''
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const emailTemplates = [
    { value: 'item_assigned', label: 'Item Assigned', icon: Mail },
    { value: 'item_returned', label: 'Item Returned', icon: CheckCircle },
    { value: 'low_stock', label: 'Low Stock Alert', icon: AlertTriangle },
    { value: 'overdue', label: 'Overdue Item', icon: Clock },
    { value: 'system_alert', label: 'System Alert', icon: AlertTriangle }
  ];

  const emailTypes = [
    { value: 'notification', label: 'Notification', color: 'blue' },
    { value: 'alert', label: 'Alert', color: 'red' },
    { value: 'report', label: 'Report', color: 'green' },
    { value: 'reminder', label: 'Reminder', color: 'yellow' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Send Email Notification
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('custom')}
              className={`pb-2 px-1 ${activeTab === 'custom' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Custom Email
            </button>
            <button
              onClick={() => setActiveTab('template')}
              className={`pb-2 px-1 ${activeTab === 'template' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Template Email
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`pb-2 px-1 ${activeTab === 'bulk' 
                ? 'border-b-2 border-blue-500 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Bulk Email
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.recipient_email}
                    onChange={(e) => setFormData({...formData, recipient_email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as 'notification' | 'alert' | 'report' | 'reminder'})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {emailTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related ID
                    </label>
                    <input
                      type="text"
                      value={formData.related_id}
                      onChange={(e) => setFormData({...formData, related_id: e.target.value ? parseInt(e.target.value) : undefined})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Related Type
                    </label>
                    <input
                      type="text"
                      value={formData.related_type}
                      onChange={(e) => setFormData({...formData, related_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === 'template' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Template
                  </label>
                  <select
                    value={templateData.type}
                    onChange={(e) => setTemplateData({...templateData, type: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {emailTemplates.map(template => (
                      <option key={template.value} value={template.value}>
                        {template.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={templateData.recipient}
                    onChange={(e) => setTemplateData({...templateData, recipient: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template Data (JSON)
                  </label>
                  <textarea
                    value={JSON.stringify(templateData.data, null, 2)}
                    onChange={(e) => {
                      try {
                        const data = JSON.parse(e.target.value);
                        setTemplateData({...templateData, data});
                      } catch (error) {
                        // Invalid JSON, don't update state
                      }
                    }}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              </>
            )}

            {activeTab === 'bulk' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bulk Email Recipients (JSON)
                </label>
                <textarea
                  placeholder={`[
  {
    "recipient_email": "user1@example.com",
    "subject": "Subject 1",
    "message": "Message 1",
    "type": "notification"
  },
  {
    "recipient_email": "user2@example.com", 
    "subject": "Subject 2",
    "message": "Message 2",
    "type": "alert"
  }
]`}
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmailNotificationModal;
