export class AuthModel {
  accessToken: string;
  refreshToken: string;

  constructor(auth: AuthModel) {
    this.accessToken = auth.accessToken;
    this.refreshToken = auth.refreshToken;
  }
}
