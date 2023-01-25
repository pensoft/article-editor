//@ts-ignore
import createLaravelPassportClient from 'laravel-passport-spa-js';
import {environment} from '@env';

export const lpClient = createLaravelPassportClient({
  // the domain of your authentication server
  domain: environment.authServer,

  // the id of your Passport client
  // eslint-disable-next-line @typescript-eslint/naming-convention
  client_id: environment.passport_client_id,

  // the uri the authentication server will send the authorization codes to
  // eslint-disable-next-line @typescript-eslint/naming-convention
  redirect_uri: `${window.location.origin}${environment.production ? '/demo' : ''}/callback`,
  isAutoRefresh: false
});

export const ssoClient = createLaravelPassportClient({
  // the domain of your authentication server
  domain: environment.authServer,

  // the id of your Passport client
  // eslint-disable-next-line @typescript-eslint/naming-convention
  client_id: environment.passport_client_id,

  oauthPrefix: 'orcid',

  // the uri the authentication server will send the authorization codes to
  // eslint-disable-next-line @typescript-eslint/naming-convention
  redirect_uri: `${window.location.origin}${environment.production ? '/demo' : ''}/callback`,
  isAutoRefresh: false
});
