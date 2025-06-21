// This file can be used to expose APIs from the main process to the renderer process.
// For now, it's empty.
console.info('Preload', 'Preload script loaded.');

import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('themeApi', {
  onThemeChange: (callback: (theme: string) => void) => {
    ipcRenderer.on('setTheme', (_event, theme) => {
      console.info('Theme API: onThemeChange listener added, theme:', theme);
      callback(theme);
    });
  }
});

contextBridge.exposeInMainWorld('electron', {
  sql: async (sql: any, params: any) => {
    return await ipcRenderer.invoke('sql', sql, params);
  },
});

contextBridge.exposeInMainWorld('electronAPI', {
  saveFile: async (filepath: string, filename: string, content: string) => {
    return await ipcRenderer.invoke('saveFile', filepath, filename, content);
  },
  openDirectory: async (dirPath: string) => {
    return await ipcRenderer.invoke('openDirectory', dirPath);
  },
});
