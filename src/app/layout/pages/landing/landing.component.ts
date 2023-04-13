import { Component, OnInit } from '@angular/core';
import { environment } from '@env';
import {lpClient, ssoClient} from "@core/services/oauth-client";
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
  version = environment.VERSION;
  build_number = environment.BUILD_NUMBER;
  hasError!: boolean;

  constructor(
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
    window.location.href = `${environment.authServer}/register?return_uri=${encodeURIComponent(window.location.href)}`
  }

  signIn() {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    console.log('CLICK');
    lpClient.signIn().then(async signInResult => {
      console.log('CLICK Result', signInResult)
      if (signInResult) {
        const token: string = await lpClient.getToken();
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

    lpClient.signIn().then(async signInResult => {
      if (signInResult) {
        const token: string = await ssoClient.getToken();
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
