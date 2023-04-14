import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from '@app/app.module';
import { AppConfig } from '@core/services/app-config';

fetch('assets/config.json')
  .then((res) => res.json())
  .then((config) => {
    if (config.production) {
      enableProdMode();
      window.console.log = () => {}

      if (window) {
        selfXSSWarning();
      }
    }

    config.apiUrl = `${config.apiGatewayService}/api`;
    config.authUrl = `${config.authService}/api`;
    config.websocketHost = removeProtocol(config.websocketHost);

    platformBrowserDynamic([{provide: AppConfig, useValue: config}])
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  }).catch(e => console.log(e));

function selfXSSWarning() {
  setTimeout(() => {
    console.log('%c!!! STOP !!!', 'font-weight:bold; font: 6em Arial; color: red; ');
    console.log(
      `\n%cThis is a browser feature intended for developers. Using this console may allow\
     attackers to impersonate you and steal your information using an attack called Self-XSS.\
     Do not enter or paste code that you do not understand.`,
      'font-weight:bold; font: 3em Arial; color: red;'
    );
  });
}

const removeProtocol = (url) => {
  if (!url) {
    return '';
  }

  return url.replace(/(^\w+:|^)\/\//, '');
}
