export interface DeviceInfo {
  device: string;
  os: string;
  browser: string;
  icon: string;
  isApproximate: boolean;
}

export function parseUserAgent(userAgent: string | null): DeviceInfo {
  if (!userAgent) {
    return {
      device: 'Unknown',
      os: 'Unknown',
      browser: 'Unknown',
      icon: '💻',
      isApproximate: false
    };
  }

  const ua = userAgent.toLowerCase();
  let isApproximate = false;
  
  // Detect Device Type
  let device = 'Desktop';
  let icon = '💻';
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    device = 'Tablet';
    icon = '📱';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    device = 'Mobile';
    icon = '📱';
  }
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows nt 10.0')) os = 'Windows 10';
  else if (ua.includes('windows nt 6.3')) os = 'Windows 8.1';
  else if (ua.includes('windows nt 6.2')) os = 'Windows 8';
  else if (ua.includes('windows nt 6.1')) os = 'Windows 7';
  else if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os x')) {
    const match = userAgent.match(/Mac OS X (\d+[._]\d+)/);
    os = match ? `macOS ${match[1].replace('_', '.')}` : 'macOS';
  }
  else if (ua.includes('android')) {
    const match = userAgent.match(/Android (\d+(\.\d+)?)/);
    if (match) {
      const version = match[1];
      // Chrome freezes Android version at 10 for privacy (UA reduction)
      // Actual version may be higher (11, 12, 13, 14, 15, etc.)
      if (version === '10' && ua.includes('chrome')) {
        os = 'Android 10+';
        isApproximate = true;
      } else {
        os = `Android ${version}`;
      }
    } else {
      os = 'Android';
    }
    icon = '🤖';
  }
  else if (ua.includes('iphone')) {
    const match = userAgent.match(/OS (\d+)[._](\d+)/);
    os = match ? `iOS ${match[1]}.${match[2]} (iPhone)` : 'iOS (iPhone)';
    icon = '📱';
  }
  else if (ua.includes('ipad')) {
    const match = userAgent.match(/OS (\d+)[._](\d+)/);
    os = match ? `iOS ${match[1]}.${match[2]} (iPad)` : 'iOS (iPad)';
    icon = '📱';
  }
  else if (ua.includes('linux')) os = 'Linux';
  
  // Detect Browser
  let browser = 'Unknown';
  if (ua.includes('edg/')) {
    const match = userAgent.match(/Edg\/(\d+)/);
    browser = match ? `Edge ${match[1]}` : 'Edge';
  }
  else if (ua.includes('chrome/') && !ua.includes('edg')) {
    const match = userAgent.match(/Chrome\/(\d+)/);
    browser = match ? `Chrome ${match[1]}` : 'Chrome';
  }
  else if (ua.includes('firefox/')) {
    const match = userAgent.match(/Firefox\/(\d+)/);
    browser = match ? `Firefox ${match[1]}` : 'Firefox';
  }
  else if (ua.includes('safari/') && !ua.includes('chrome')) {
    const match = userAgent.match(/Version\/(\d+)/);
    browser = match ? `Safari ${match[1]}` : 'Safari';
  }
  else if (ua.includes('opera') || ua.includes('opr/')) {
    const match = userAgent.match(/OPR\/(\d+)/);
    browser = match ? `Opera ${match[1]}` : 'Opera';
  }
  else if (ua.includes('trident/')) browser = 'Internet Explorer';
  
  return {
    device,
    os,
    browser,
    icon,
    isApproximate
  };
}

export function getDeviceDisplay(userAgent: string | null): string {
  const info = parseUserAgent(userAgent);
  const approximate = info.isApproximate ? ' (or newer)' : '';
  return `${info.icon} ${info.device} • ${info.os}${approximate} • ${info.browser}`;
}

export function getDeviceDisplayShort(userAgent: string | null): string {
  const info = parseUserAgent(userAgent);
  return `${info.icon} ${info.os} • ${info.browser}`;
}
