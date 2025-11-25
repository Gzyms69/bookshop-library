import debugLogger from './debugLogger';

// Initialize debug logging on page load
export const initDebug = () => {
  // Log page load
  debugLogger.log('PAGE_LOAD', {
    url: window.location.href,
    userAgent: navigator.userAgent,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    },
    timestamp: Date.now()
  });

  // Log any errors
  window.addEventListener('error', (event) => {
    debugLogger.log('WINDOW_ERROR', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }, 'error');
  });

  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    debugLogger.log('UNHANDLED_REJECTION', {
      reason: event.reason,
      stack: event.reason?.stack,
      message: event.reason?.message
    }, 'error');
  });

  console.log('✅ Debug logging initialized. Use debugLogger in console.');
};

// Auto-initialize in development
if (process.env.NODE_ENV === 'development') {
  initDebug();
}