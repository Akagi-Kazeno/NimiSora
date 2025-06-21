import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {App} from './app/app';

if (window.themeApi) {
  window.themeApi.onThemeChange((theme) => {
    document.body.setAttribute('data-theme', theme);
    // 在这里根据 theme 动态切换样式表或变量
  });
}

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
