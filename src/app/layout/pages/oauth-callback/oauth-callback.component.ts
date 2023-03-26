import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BroadcasterService } from '@core/services/broadcaster.service';
import { FormioBaseService } from '@core/services/formio-base.service';
import { CONSTANTS } from '@core/services/constants';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { of, pipe, Subscription } from 'rxjs';
import { UserModel } from '@core/models/user.model';
import {lpClient} from "@core/services/oauth-client";

@Component({
  selector: 'app-oauth-callback',
  templateUrl: './oauth-callback.component.html',
  styleUrls: ['./oauth-callback.component.scss']
})
export class OauthCallbackComponent implements OnInit, OnDestroy {
  returnUrl: string;
  private unsubscribe: Subscription[] = [];
  hasError: boolean;
  constructor(private readonly authService: AuthService,
              private route: ActivatedRoute,
              private router: Router,
              private _broadcaster: BroadcasterService,
              public formioBaseService: FormioBaseService) { }

  ngOnInit(): void {
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
    this._broadcaster.broadcast(CONSTANTS.SHOW_LOADER, true);

    this.hasError = false;
    lpClient.handleRedirectCallback().then( async signInResult => {
      const token = await lpClient.getToken();
      this.authService.storeToken(token);
      debugger;
      const loginSubscr = this.authService.getUserInfo().pipe(take(1))
        .subscribe((user: UserModel | undefined) => {
        if (user) {
          this.router.navigate(['/dashboard']);
          this.formioBaseService.login();
        } else {
          this.hasError = true;
        }
      });
      this.unsubscribe.push(loginSubscr);
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
