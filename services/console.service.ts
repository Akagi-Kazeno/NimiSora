// 控制台打印服务层
export class ConsoleService {
  LOG_PREFIX = 'NimiSora';
  styleTimestampTag = 'background-color: #917BE8; color: white; padding: 1px 4px; border-radius: 3px; margin-right: 4px;';
  styleModule = 'background-color: #7CABE8; color: white; padding: 1px 4px; border-radius: 3px; margin-right: 4px;';
  styleNimiSoraPrefix = 'background-color: rgba(245, 200, 235, 1); color: white; padding: 1px 4px; border-radius: 3px; margin-right: 4px; font-weight: bold;';

  getTimestamp(): string {
    return new Date().toISOString();
  }

  styleLevel = (level: string) => {
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

  createLogArgs(level: string, moduleName?: string, message?: any, ...optionalParams: any[]): any[] {
    const timestamp = this.getTimestamp();
    let formatString = `%c${this.LOG_PREFIX}%c`;
    const styles: string[] = [this.styleNimiSoraPrefix, ''];
    if (moduleName) {
      formatString += ` %c${moduleName}%c`;
      styles.push(this.styleModule);
      styles.push('');
    }
    formatString += ` %c${level}%c`;
    styles.push(this.styleLevel(level));
    styles.push('');
    formatString += ` %c${timestamp}%c`;
    styles.push(this.styleTimestampTag);
    styles.push('');
    return [formatString, ...styles, message, ...optionalParams];
  }

  Info(moduleName: string, message?: any, ...optionalParams: any[]): void;
  Info(message?: any, ...optionalParams: any[]): void;
  Info(moduleOrMessage: string | any, ...rest: any[]): void {
    let args: any[];
    if (typeof moduleOrMessage === 'string' && rest.length > 0 && rest[0] !== undefined) {
      args = this.createLogArgs('INFO', moduleOrMessage, rest[0], ...rest.slice(1));
    } else {
      args = this.createLogArgs('INFO', undefined, moduleOrMessage, ...rest);
    }
    console.info(...args);
  }

  Warn(moduleName: string, message?: any, ...optionalParams: any[]): void;
  Warn(message?: any, ...optionalParams: any[]): void;
  Warn(moduleOrMessage: string | any, ...rest: any[]): void {
    let args: any[];
    if (typeof moduleOrMessage === 'string' && rest.length > 0 && rest[0] !== undefined) {
      args = this.createLogArgs('WARN', moduleOrMessage, rest[0], ...rest.slice(1));
    } else {
      args = this.createLogArgs('WARN', undefined, moduleOrMessage, ...rest);
    }
    console.warn(...args);
  }

  Error(moduleName: string, message?: any, ...optionalParams: any[]): void;
  Error(message?: any, ...optionalParams: any[]): void;
  Error(moduleOrMessage: string | any, ...rest: any[]): void {
    let args: any[];
    if (typeof moduleOrMessage === 'string' && rest.length > 0 && rest[0] !== undefined) {
      args = this.createLogArgs('ERROR', moduleOrMessage, rest[0], ...rest.slice(1));
    } else {
      args = this.createLogArgs('ERROR', undefined, moduleOrMessage, ...rest);
    }
    console.error(...args);
  }

  Debug(moduleName: string, message?: any, ...optionalParams: any[]): void;
  Debug(message?: any, ...optionalParams: any[]): void;
  Debug(moduleOrMessage: string | any, ...rest: any[]): void {
    let args: any[];
    if (typeof moduleOrMessage === 'string' && rest.length > 0 && rest[0] !== undefined) {
      args = this.createLogArgs('DEBUG', moduleOrMessage, rest[0], ...rest.slice(1));
    } else {
      args = this.createLogArgs('DEBUG', undefined, moduleOrMessage, ...rest);
    }
    console.log(...args);
  }
}
