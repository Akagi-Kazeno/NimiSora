declare global {
  interface Window {
    themeApi: {
      onThemeChange: (callback: (theme: string) => void) => void;
    };

    electron: {
      sql: (sql: any, params: any) => Promise<any>;
    };

    electronAPI: {
      saveFile: (filepath: string, filename: string, content: string) => Promise<{
        success: boolean;
        filePath?: string;
        error?: string;
      }>;

      openDirectory: (dirPath: string) => Promise<{
        success: boolean;
        dirPath?: string;
        error?: string;
      }>;

      moveDirectory: (oldPath: string, newPath: string) => Promise<{
        success: boolean;
        oldPath?: string;
        newPath?: string;
        error?: string;
      }>;
    };
  }
}

export {};
