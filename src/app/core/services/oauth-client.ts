//@ts-ignore
import createLaravelPassportClient from 'laravel-passport-spa-js';
import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

@Injectable({providedIn: 'root'})
export class OauthClient {
  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
  ){}

  public lpClient = createLaravelPassportClient({
    // the domain of your authentication server
    domain: this.config.authService,

    // the id of your Passport client
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: this.config.pkceClientId,

    // the uri the authentication server will send the authorization codes to
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uri: `${window.location.origin}/callback`,
    isAutoRefresh: false
  });

  public ssoClient = createLaravelPassportClient({
    // the domain of your authentication server
    domain: this.config.authService,

    // the id of your Passport client
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: this.config.pkceClientId,

    oauthPrefix: 'orcid',

    // the uri the authentication server will send the authorization codes to
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uri: `${window.location.origin}/callback`,
    isAutoRefresh: false
  });
}
