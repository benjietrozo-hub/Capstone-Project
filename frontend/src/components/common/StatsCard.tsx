import React, { CSSProperties } from 'react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

interface StatsCardProps {
  icon: React.ReactNode;
  number: number | string;
  label: string;
  gradient?: string;
  chartType?: 'doughnut' | 'line' | 'bar';
  chartData?: any;
  trend?: number[];
}

export function StatsCard({ 
  icon, 
  number, 
  label, 
  gradient = 'linear-gradient(135deg, #2d7a3e, #1e5a2e)',
  chartType = 'doughnut',
  chartData = null,
  trend = null
}: StatsCardProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: chartType !== 'doughnut'
      }
    },
    scales: chartType === 'doughnut' ? {} : {
      x: {
        display: false,
        grid: {
          display: false
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        }
      }
    },
    cutout: chartType === 'doughnut' ? '70%' : undefined
  };

  const defaultChartData: Record<string, any> = {
    doughnut: {
      labels: ['Used', 'Available'],
      datasets: [{
        data: [number || 0, 100 - (Number(number) || 0)],
        backgroundColor: ['#2d7a3e', '#e9ecef'],
        borderWidth: 0
      }]
    },
    line: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        data: trend || [12, 19, 15, 25, 22, 30, Number(number) || 0],
        borderColor: gradient.includes('2d7a3e') ? '#2d7a3e' : '#ffd43b',
        backgroundColor: gradient.includes('2d7a3e') ? 'rgba(45, 122, 62, 0.1)' : 'rgba(255, 212, 59, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        borderWidth: 2
      }]
    },
    bar: {
      labels: ['Value'],
      datasets: [{
        data: [number || 0],
        backgroundColor: gradient.includes('2d7a3e') ? '#2d7a3e' : '#ee5a52',
        borderRadius: 4
      }]
    }
  };

  const data = chartData || defaultChartData[chartType];

  const renderChart = () => {
    if (!data) return null;
    
    switch (chartType) {
      case 'doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      case 'line':
        return <Line data={data} options={chartOptions} />;
      case 'bar':
        return <Bar data={data} options={chartOptions} />;
      default:
        return null;
    }
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '10px',
      padding: '25px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      borderLeft: `4px solid ${gradient.includes('2d7a3e') ? '#2d7a3e' : '#667eea'}`,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }}
    >
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        color: 'white',
        marginBottom: '15px',
        background: gradient
      }}>
        {icon}
      </div>
      
      <div style={{
        fontSize: '2rem',
        fontWeight: '700',
        color: '#333',
        marginBottom: '5px'
      }}>
        {typeof number === 'number' ? number.toLocaleString() : number}
      </div>
      
      <div style={{
        color: '#6c757d',
        fontWeight: '500',
        marginBottom: '15px',
        flex: 1
      }}>
        {label}
      </div>
      
      {data && (
        <div style={{ height: '60px', marginTop: 'auto' }}>
          {renderChart()}
        </div>
      )}
    </div>
  );
}
