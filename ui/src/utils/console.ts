const LOG_PREFIX = 'NimiSora';

function getTimestamp(): string {
  return new Date().toISOString();
}

const styleTimestampTag = 'background-color: #917BE8; color: white; padding: 1px 4px; border-radius: 3px; margin-right: 4px;';
const styleModule = 'background-color: #7CABE8; color: white; padding: 1px 4px; border-radius: 3px; margin-right: 4px;';
const styleLevel = (level: string) => {
  let bgColor = 'rgba(189, 182, 173, 1)';
  switch (level) {
    case 'INFO':
      bgColor = 'rgba(66, 130, 211, 1)';
      break;
    case 'WARN':
      bgColor = 'rgba(245, 138, 59, 1)';
      break;
    case 'ERROR':
      bgColor = 'rgba(189, 36, 52, 1)';
      break;
    case 'DEBUG':
      bgColor = 'rgba(51, 159, 16, 1)';
      break;
  }
  return `background-color: ${bgColor}; color: white; padding: 1px 4px; border-radius: 3px; margin-right: 4px; font-weight: bold;`;
};

const styleNimiSoraPrefix = 'background-color: rgba(245, 200, 235, 1); color: white; padding: 1px 4px; border-radius: 3px; margin-right: 4px; font-weight: bold;';

function createLogArgs(level: string, moduleName?: string, message?: any, ...optionalParams: any[]): any[] {
  const timestamp = getTimestamp();
  let formatString = `%c${LOG_PREFIX}%c`;
  const styles: string[] = [styleNimiSoraPrefix, ''];
  if (moduleName) {
    formatString += ` %c${moduleName}%c`;
    styles.push(styleModule);
    styles.push('');
  }
  formatString += ` %c${level}%c`;
  styles.push(styleLevel(level));
  styles.push('');
  formatString += ` %c${timestamp}%c`;
  styles.push(styleTimestampTag);
  styles.push('');
  return [formatString, ...styles, message, ...optionalParams];
}


export function logInfo(moduleName: string, message?: any, ...optionalParams: any[]): void;
export function logInfo(message?: any, ...optionalParams: any[]): void;
export function logInfo(moduleOrMessage: string | any, ...rest: any[]): void {
  let args: any[];

  if (typeof moduleOrMessage === 'string' && rest.length > 0 && rest[0] !== undefined) {
    args = createLogArgs('INFO', moduleOrMessage, rest[0], ...rest.slice(1));
  } else {
    args = createLogArgs('INFO', undefined, moduleOrMessage, ...rest);
  }
  console.info(...args);
}

export function logWarn(moduleName: string, message?: any, ...optionalParams: any[]): void;
export function logWarn(message?: any, ...optionalParams: any[]): void;
export function logWarn(moduleOrMessage: string | any, ...rest: any[]): void {
  let args: any[];
  if (typeof moduleOrMessage === 'string' && rest.length > 0 && rest[0] !== undefined) {
    args = createLogArgs('WARN', moduleOrMessage, rest[0], ...rest.slice(1));
  } else {
    args = createLogArgs('WARN', undefined, moduleOrMessage, ...rest);
  }
  console.warn(...args);
}

export function logError(moduleName: string, message?: any, ...optionalParams: any[]): void;
export function logError(message?: any, ...optionalParams: any[]): void;
export function logError(moduleOrMessage: string | any, ...rest: any[]): void {
  let args: any[];
  if (typeof moduleOrMessage === 'string' && rest.length > 0 && rest[0] !== undefined) {
    args = createLogArgs('ERROR', moduleOrMessage, rest[0], ...rest.slice(1));
  } else {
    args = createLogArgs('ERROR', undefined, moduleOrMessage, ...rest);
  }
  console.error(...args);
}

export function logDebug(moduleName: string, message?: any, ...optionalParams: any[]): void;
export function logDebug(message?: any, ...optionalParams: any[]): void;
export function logDebug(moduleOrMessage: string | any, ...rest: any[]): void {
  let args: any[];
  if (typeof moduleOrMessage === 'string' && rest.length > 0 && rest[0] !== undefined) {
    args = createLogArgs('DEBUG', moduleOrMessage, rest[0], ...rest.slice(1));
  } else {
    args = createLogArgs('DEBUG', undefined, moduleOrMessage, ...rest);
  }
  console.log(...args);
}
