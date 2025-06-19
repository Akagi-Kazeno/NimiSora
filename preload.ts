// This file can be used to expose APIs from the main process to the renderer process.
// For now, it's empty.
console.info('Preload', 'Preload script loaded.');

import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('themeApi', {
  onThemeChange: (callback: (theme: string) => void) => {
    ipcRenderer.on('set-theme', (_event, theme) => {
      console.info('Theme API: onThemeChange listener added, theme:', theme);
      callback(theme);
    });
  }
});
