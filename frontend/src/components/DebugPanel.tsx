import React from 'react';
import debugLogger from '../utils/debugLogger';

export const DebugPanel: React.FC = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [logs, setLogs] = React.useState<any[]>([]);

  const updateLogs = () => {
    setLogs(debugLogger.getLogs());
  };

  React.useEffect(() => {
    // Update logs every second when visible
    let interval: NodeJS.Timeout;
    if (isVisible) {
      updateLogs();
      interval = setInterval(updateLogs, 1000);
    }
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-lg z-50"
      >
        Debug
      </button>
    );
  }

  return (
    <div className="fixed inset-4 bg-gray-900 bg-opacity-95 z-50 p-4 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Debug Panel</h2>
        <div className="space-x-2">
          <button
            onClick={() => debugLogger.exportLogs()}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Export Logs
          </button>
          <button
            onClick={() => debugLogger.clear()}
            className="bg-yellow-500 text-white px-4 py-2 rounded"
          >
            Clear
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
      
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className={`p-2 rounded ${
            log.level === 'error' ? 'bg-red-900' : 
            log.level === 'warn' ? 'bg-yellow-900' : 'bg-gray-800'
          }`}>
            <div className="text-sm text-gray-300">
              [{log.timestamp}] {log.category}
            </div>
            <pre className="text-xs text-white mt-1">
              {JSON.stringify(log.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};