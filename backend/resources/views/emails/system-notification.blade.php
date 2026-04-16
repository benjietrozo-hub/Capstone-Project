<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title }} - OlineIMS Notification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #5B8DEF, #0063F7);
            color: white;
            padding: 20px;
            border-radius: 10px 10px 0 0;
            text-align: center;
            margin: -30px -30px 20px -30px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            margin-bottom: 30px;
        }
        .message-box {
            background-color: #f8f9fa;
            border-left: 4px solid #5B8DEF;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
        }
        .type-badge {
            display: inline-block;
            background-color: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            margin-bottom: 15px;
        }
        .footer {
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #5B8DEF, #0063F7);
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: 500;
            margin-top: 15px;
        }
        .action-button:hover {
            opacity: 0.9;
        }
        .urgent {
            border-left-color: #f44336;
        }
        .urgent .type-badge {
            background-color: #ffebee;
            color: #c62828;
        }
        .success {
            border-left-color: #4caf50;
        }
        .success .type-badge {
            background-color: #e8f5e8;
            color: #2e7d32;
        }
        .warning {
            border-left-color: #ff9800;
        }
        .warning .type-badge {
            background-color: #fff3e0;
            color: #f57c00;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏫 OlineIMS</h1>
            <p>Online Inventory Management System</p>
        </div>

        <div class="content">
            <div class="type-badge">{{ $type }}</div>
            
            <h2>{{ $title }}</h2>
            
            <div class="message-box {{ $this->getMessageBoxClass($type) }}">
                {{ $message }}
            </div>

            @if($this->shouldShowActionButton($type))
                <a href="{{ config('app.url') }}" class="action-button">
                    Go to OlineIMS
                </a>
            @endif

            @if($relatedId && $relatedType)
                <p style="font-size: 12px; color: #666; margin-top: 20px;">
                    Reference: {{ $relatedType }} #{{ $relatedId }}
                </p>
            @endif
        </div>

        <div class="footer">
            <p>This is an automated message from the Online Inventory Management System.</p>
            <p>If you have questions, please contact your system administrator.</p>
            <p>&copy; {{ date('Y') }} OlineIMS. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

@php
    function getMessageBoxClass($type) {
        if (in_array($type, ['item_overdue', 'item_overdue_admin'])) {
            return 'urgent';
        } elseif (in_array($type, ['borrow_request_approved', 'distribution_approved', 'item_returned', 'distribution_returned'])) {
            return 'success';
        } elseif (in_array($type, ['low_stock'])) {
            return 'warning';
        }
        return '';
    }

    function shouldShowActionButton($type) {
        return in_array($type, [
            'borrow_request_created',
            'distribution_request_created',
            'low_stock',
            'purchase_order_created'
        ]);
    }
@endphp
