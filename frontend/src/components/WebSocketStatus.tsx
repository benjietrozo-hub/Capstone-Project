import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface WebSocketStatusProps {
  className?: string;
}

export const WebSocketStatus: React.FC<WebSocketStatusProps> = ({ className = '' }) => {
  const { isConnected, connectionState } = useWebSocket();
  const [showTooltip, setShowTooltip] = useState(false);

  const getStatusIcon = () => {
    if (isConnected) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    }
    
    switch (connectionState) {
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'disabled':
        return <WifiOff className="w-4 h-4 text-gray-400" />;
      case 'unsupported':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    if (isConnected) {
      return 'WebSocket Connected';
    }
    
    switch (connectionState) {
      case 'connecting':
        return 'WebSocket Connecting...';
      case 'disabled':
        return 'WebSocket Disabled';
      case 'unsupported':
        return 'WebSocket Not Supported';
      case 'error':
        return 'WebSocket Error';
      case 'failed':
        return 'WebSocket Connection Failed';
      default:
        return 'WebSocket Disconnected';
    }
  };

  const getStatusColor = () => {
    if (isConnected) {
      return 'text-green-500';
    }
    
    switch (connectionState) {
      case 'connecting':
        return 'text-yellow-500';
      case 'disabled':
        return 'text-gray-400';
      case 'unsupported':
        return 'text-red-500';
      default:
        return 'text-red-500';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {getStatusIcon()}
        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} />
      </div>
      <span className={`text-sm ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
};

export default WebSocketStatus;
