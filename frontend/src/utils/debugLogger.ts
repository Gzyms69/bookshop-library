// Comprehensive debug logger for frontend debugging
type LogLevel = 'info' | 'warn' | 'error' | 'none';
type OutputMode = 'console' | 'silent';

class DebugLogger {
  private logs: any[] = [];
  private isEnabled = true;
  private logLevel: LogLevel = 'info';
  private outputMode: OutputMode = 'console';

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = level;
  }

  setOutputMode(mode: OutputMode) {
    this.outputMode = mode;
  }

  getOutputMode() {
    return this.outputMode;
  }

  log(category: string, data: any, level: Exclude<LogLevel, 'none'> = 'info') {
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

    if (this.outputMode === 'console') {
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

  dumpToConsole(filter?: { level?: Exclude<LogLevel, 'none'>; category?: string }) {
    console.groupCollapsed('DebugLogger Dump');
    this.logs.forEach((log) => {
      if (filter?.level && log.level !== filter.level) return;
      if (filter?.category && log.category !== filter.category) return;
      console.group(`[${log.timestamp}] ${log.category} (${log.level})`);
      console.log(log.data);
      console.groupEnd();
    });
    console.groupEnd();
  }

  private downloadFile(content: string, mime: string, extension: string) {
    const dataBlob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `frontend-debug-${Date.now()}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  exportLogsAsJSON() {
    const dataStr = JSON.stringify(this.logs, null, 2);
    this.downloadFile(dataStr, 'application/json', 'json');
  }

  exportLogsAsTxt() {
    const textStr = this.logs
      .map(
        (log) =>
          `[${log.timestamp}] ${log.category} (${log.level})\n${JSON.stringify(
            log.data,
            null,
            2,
          )}`,
      )
      .join('\n\n---\n\n');
    this.downloadFile(textStr, 'text/plain', 'txt');
  }

  // Legacy helper
  exportLogs() {
    this.exportLogsAsJSON();
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