import { Component, Inject, OnInit } from '@angular/core';
import Packages from '../../../../../package.json';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';
import { OauthClient } from '@app/core/services/oauth-client';
import {take} from "rxjs/operators";
import {UserModel} from "@core/models/user.model";
import {ServiceShare} from "@app/editor/services/service-share.service";
import {AuthService} from "@core/services/auth.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BroadcasterService} from "@core/services/broadcaster.service";
import {FormioBaseService} from "@core/services/formio-base.service";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  version = `${Packages.version}`;
  hasError!: boolean;

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private readonly oauthClient: OauthClient,
    private serviceShare: ServiceShare,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private _broadcaster: BroadcasterService,
    public formioBaseService: FormioBaseService
  ) { }

  ngOnInit(): void {
  }

  goToRegister() {
    window.location.href = `${this.config.authService}/register?return_uri=${encodeURIComponent(window.location.href)}`
  }

  signIn() {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    this.oauthClient.lpClient.signIn().then(async signInResult => {
      if (signInResult) {
        const token: string = await this.oauthClient.lpClient.getToken();
        this.authService.storeToken(token);
        const loginSubscr = this.authService.getUserInfo(token).pipe(take(1))
          .subscribe((user: UserModel | undefined) => {
            if (user) {
              setTimeout(()=>{
                this.router.navigate(['/dashboard']);
              },2000)
              this.formioBaseService.login();
            } else {
              this.hasError = true;
            }
          });
      }
    }).catch(err => {console.error(err)});
  }

  orcidSignIn() {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();

    this.oauthClient.lpClient.signIn().then(async signInResult => {
      if (signInResult) {
        const token: string = await this.oauthClient.ssoClient.getToken();
        this.authService.storeToken(token);
        const loginSubscr = this.authService.getUserInfo(token).pipe(take(1))
          .subscribe((user: UserModel | undefined) => {
            if (user) {
              setTimeout(()=>{
                this.router.navigate(['/dashboard']);
              },2000)
              this.formioBaseService.login();
            } else {
              this.hasError = true;
            }
          });
      }
    }).catch(err => {console.error(err)});
  }
}
