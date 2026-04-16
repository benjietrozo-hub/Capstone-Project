<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #5B8DEF;
        }
        .header h1 {
            color: #333;
            margin: 0;
            font-size: 24px;
        }
        .content {
            margin-bottom: 30px;
        }
        .content h2 {
            color: #5B8DEF;
            font-size: 18px;
            margin-bottom: 15px;
        }
        .content p {
            margin-bottom: 15px;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #5B8DEF;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-box strong {
            color: #333;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background-color: #5B8DEF;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 15px 0;
        }
        .btn:hover {
            background-color: #0063F7;
        }
        .urgent {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
        }
        .warning {
            background-color: #f8d7da;
            border-left: 4px solid #dc3545;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{ $title }}</h1>
        </div>

        <div class="content">
            <p>Dear {{ $teacher->full_name }},</p>

            <p>{{ $message }}</p>

            @if(isset($data['item_name']))
                <div class="info-box">
                    <h3>Item Details:</h3>
                    <p><strong>Item:</strong> {{ $data['item_name'] }}</p>
                    @if(isset($data['quantity']))
                        <p><strong>Quantity:</strong> {{ $data['quantity'] }}</p>
                    @endif
                    @if(isset($data['expected_return_date']))
                        <p><strong>Expected Return Date:</strong> {{ date('F j, Y', strtotime($data['expected_return_date'])) }}</p>
                    @endif
                    @if(isset($data['group_name']))
                        <p><strong>Group:</strong> {{ $data['group_name'] }}</p>
                    @endif
                </div>
            @endif

            @if($type === 'distribution_overdue' || $type === 'distribution_returned' || $type === 'distribution_due_soon')
                <div class="info-box {{ $type === 'distribution_overdue' ? 'warning' : ($type === 'distribution_due_soon' ? 'urgent' : 'urgent') }}">
                    <h3>{{ $type === 'distribution_overdue' ? 'URGENT: Overdue Item' : ($type === 'distribution_due_soon' ? 'Return Due Soon' : 'Return Reminder') }}</h3>
                    @if(isset($data['days_overdue']))
                        <p>This item is <strong>{{ $data['days_overdue'] }} day(s) overdue</strong>.</p>
                    @endif
                    @if(isset($data['days_until_due']))
                        <p>This item is due for return in <strong>{{ $data['days_until_due'] }} day(s)</strong>.</p>
                    @endif
                    <p>Please return the item(s) to the inventory office as soon as possible to avoid any penalties.</p>
                </div>
            @endif

            @if($type === 'bulk_distributed' || $type === 'item_distributed')
                <p>Please visit the inventory office to collect your assigned item(s) during working hours.</p>
                <p>Remember to bring your ID card for verification.</p>
            @endif

            @if($type === 'distribution_cancelled')
                <p>We apologize for any inconvenience this may cause. Please contact the inventory office for more information.</p>
            @endif
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.url') }}/teacher/inventory" class="btn">
                View My Inventory
            </a>
        </div>

        <div class="footer">
            <p>This is an automated message from the Online Inventory Management System.</p>
            <p>If you have any questions, please contact the inventory administrator.</p>
            <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
