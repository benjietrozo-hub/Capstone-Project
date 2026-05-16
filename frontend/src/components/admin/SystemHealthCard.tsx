import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { adminAPI } from '@/api';
import { ShieldCheck, Activity, Database, Clock, Server, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SystemHealthCard() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const response = await adminAPI.getSystemHealth();
      if (response.data.success) {
        setHealth(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !health) {
    return (
      <Card className="border-none shadow-md animate-pulse">
        <CardContent className="h-48 flex items-center justify-center">
          <div className="text-gray-400 text-sm font-medium">Monitoring System Health...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md overflow-hidden bg-white group">
      <CardHeader className="bg-gray-50/50 border-b pb-3 pt-4 px-5">
        <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            System Availability
          </div>
          <div className="flex items-center gap-1.5 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
            <CheckCircle2 className="w-3 h-3" />
            {health.status}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
              <Clock className="w-3 h-3" /> Uptime
            </div>
            <div className="text-lg font-black text-gray-800">{health.uptime}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
              <Database className="w-3 h-3" /> DB Status
            </div>
            <div className="text-lg font-black text-green-600 flex items-center gap-1">
              {health.database}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
              <Server className="w-3 h-3" /> Latency
            </div>
            <div className="text-lg font-black text-gray-800">{health.api_latency}</div>
          </div>
          <div className="space-y-1">
            <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Build
            </div>
            <div className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-sm inline-block">
              {health.version}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mb-2">
            <span>Server Load</span>
            <span className="text-primary">Normal</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[12%] rounded-full"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
