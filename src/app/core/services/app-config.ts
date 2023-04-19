import { InjectionToken } from '@angular/core';

export class AppConfig {
  production: boolean;
  websocketHost: string;
  externalRefsApi: string;
  websocketPort: string;
  authUrl: string;
  apiUrl: string;
  pkceClientId: string;
  pgClientId: string;
  pgClientSecret: string;
  validateJats: string;
  eventDispatcherService: string;

  authService: string;
  apiGatewayService: string;
  articleApiVersion: string;
}

export let APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG')
