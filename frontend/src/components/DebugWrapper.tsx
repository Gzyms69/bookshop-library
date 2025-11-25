import React from 'react';
import debugLogger from '../utils/debugLogger';

interface DebugWrapperProps {
  componentName: string;
  children: React.ReactNode;
  props?: any;
}

export const DebugWrapper: React.FC<DebugWrapperProps> = ({ 
  componentName, 
  children, 
  props 
}) => {
  React.useEffect(() => {
    debugLogger.logComponent(componentName, props, {
      mounted: true,
      mountTime: performance.now()
    });
  }, [componentName, props]);

  return <>{children}</>;
};