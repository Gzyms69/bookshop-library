// Comprehensive debug logger for frontend debugging
class DebugLogger {
  private logs: any[] = [];
  private isEnabled = true;
  private logLevel: 'info' | 'warn' | 'error' | 'none' = 'info';

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  setLogLevel(level: 'info' | 'warn' | 'error' | 'none') {
    this.logLevel = level;
  }

  log(category: string, data: any, level: 'info' | 'warn' | 'error' = 'info') {
    if (!this.isEnabled || this.logLevel === 'none') return;
    
    // Filter by log level
    if (this.logLevel === 'warn' && level === 'info') return;
    if (this.logLevel === 'error' && level !== 'error') return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      category,
      level,
      data: typeof data === 'object' ? JSON.parse(JSON.stringify(data)) : data
    };

    this.logs.push(logEntry);

    // Also log to console for immediate visibility
    const consoleMessage = `[${timestamp}] ${category}:`;
    switch (level) {
      case 'error':
        console.error(consoleMessage, data);
        break;
      case 'warn':
        console.warn(consoleMessage, data);
        break;
      default:
        console.log(consoleMessage, data);
    }
  }

  // Log component render with props
  logComponent(componentName: string, props: any, additionalInfo?: any) {
    this.log(`COMPONENT:${componentName}`, {
      props,
      additionalInfo,
      renderTime: performance.now()
    });
  }

  // Log style application
  logStyles(componentName: string, elementInfo: any, expectedClasses: string, actualClasses: string) {
    this.log(`STYLES:${componentName}`, {
      elementInfo,
      expectedClasses,
      actualClasses,
      mismatch: expectedClasses !== actualClasses
    });
  }

  // Log API calls
  logApiCall(url: string, method: string, request: any, response: any, error?: any) {
    this.log('API_CALL', {
      url,
      method,
      request,
      response,
      error,
      timestamp: Date.now()
    });
  }

  // Get all logs
  getLogs() {
    return this.logs;
  }

  // Export logs as downloadable file
  exportLogs() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `frontend-debug-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Clear logs
  clear() {
    this.logs = [];
  }
}

// Create global instance
const debugLogger = new DebugLogger();

// Make it available globally for browser console access
(window as any).debugLogger = debugLogger;

export default debugLogger;