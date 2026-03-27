import React, { useState } from 'react';
import { Mail, Bell, Send, Users, History } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import EmailNotificationModal from './EmailNotificationModal';
import EmailHistory from './EmailHistory';
import EnhancedNotificationProfile from './EnhancedNotificationProfile';

const EmailNotificationExample: React.FC = () => {
  const { sendEmailNotification } = useNotifications();
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');

  const handleQuickEmail = async () => {
    try {
      await sendEmailNotification({
        recipient_email: recipientEmail,
        title: 'Quick Test Notification',
        message: 'This is a test email notification sent from the React application.',
        type: 'notification'
      });
      setRecipientEmail('');
    } catch (error) {
      console.error('Failed to send quick email:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Email Notification System</h1>
        <p className="text-gray-600">
          Send email notifications alongside your real-time WebSocket notifications
        </p>
      </div>

      {/* Enhanced Notification Profile */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Notification Center</h2>
        <div className="bg-white p-4 rounded-lg shadow">
          <EnhancedNotificationProfile />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setShowEmailModal(true)}
          className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
        >
          <Mail className="w-5 h-5" />
          <span>Send Email</span>
        </button>

        <button
          onClick={() => setShowHistory(true)}
          className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"
        >
          <History className="w-5 h-5" />
          <span>Email History</span>
        </button>

        <button
          onClick={() => setShowEmailModal(true)}
          className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 flex items-center justify-center space-x-2"
        >
          <Users className="w-5 h-5" />
          <span>Bulk Email</span>
        </button>

        <button
          className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 flex items-center justify-center space-x-2"
        >
          <Bell className="w-5 h-5" />
          <span>Templates</span>
        </button>
      </div>

      {/* Quick Email Form */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-semibold mb-4">Quick Email Test</h3>
        <div className="flex space-x-4">
          <input
            type="email"
            placeholder="Enter recipient email..."
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleQuickEmail}
            disabled={!recipientEmail}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send Quick Email</span>
          </button>
        </div>
      </div>

      {/* Email History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Email History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <EmailHistory />
            </div>
          </div>
        </div>
      )}

      {/* Email Notification Modal */}
      <EmailNotificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        recipientEmail={recipientEmail}
      />

      {/* Usage Examples */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">1. Send Custom Email</h4>
            <pre className="text-sm bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`const { sendEmailNotification } = useNotifications();

await sendEmailNotification({
  recipient_email: 'user@example.com',
  title: 'Item Assigned',
  message: 'You have been assigned a new item.',
  type: 'notification',
  related_id: 123,
  related_type: 'item'
});`}
            </pre>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">2. Use Email Service Directly</h4>
            <pre className="text-sm bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`import emailService from '@/services/emailService';

await emailService.sendTemplateEmail({
  type: 'item_assigned',
  recipient: 'user@example.com',
  data: { itemName: 'Projector', quantity: 1 }
});`}
            </pre>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">3. Send Bulk Emails</h4>
            <pre className="text-sm bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`await emailService.sendBulkEmails([
  {
    recipient_email: 'user1@example.com',
    subject: 'System Maintenance',
    message: 'System will be down for maintenance.',
    type: 'alert'
  },
  {
    recipient_email: 'user2@example.com',
    subject: 'System Maintenance', 
    message: 'System will be down for maintenance.',
    type: 'alert'
  }
]);`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailNotificationExample;
