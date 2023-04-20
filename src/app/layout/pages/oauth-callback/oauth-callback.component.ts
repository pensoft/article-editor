import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BroadcasterService } from '@core/services/broadcaster.service';
import { FormioBaseService } from '@core/services/formio-base.service';
import { CONSTANTS } from '@core/services/constants';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { of, pipe, Subscription } from 'rxjs';
import { UserModel } from '@core/models/user.model';
import { OauthClient } from '@app/core/services/oauth-client';

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss']
})
export class OauthCallbackComponent implements OnInit {
  returnUrl: string;
  hasError: boolean;
  constructor(private readonly authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private _broadcaster: BroadcasterService,
              public formioBaseService: FormioBaseService,
              private readonly oauthClient: OauthClient) { }

  ngOnInit(): void {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
    this._broadcaster.broadcast(CONSTANTS.SHOW_LOADER, true);

    this.hasError = false;
    const begin = performance.now();
    this.oauthClient.lpClient.handleRedirectCallback().then( async signInResult => {
      const token = await this.oauthClient.lpClient.getToken();
      this.authService.storeToken(token);
      const loginSubscr = this.authService.getUserInfo(token).pipe(take(1))
        .subscribe((user: UserModel | undefined) => {
        if (user) {
          const requestDuration = `${performance.now() - begin}`;
          console.log(`${requestDuration} ms <--`);
          this.router.navigate(['/dashboard']);
          this.formioBaseService.login();
        } else {
          this.hasError = true;
        }
      });
    });
  }

}
