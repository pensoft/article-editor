import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserModel } from '@core/models/user.model';
import { AuthService } from '@core/services/auth.service';
import { BroadcasterService } from '@core/services/broadcaster.service';
import { CONSTANTS } from '@core/services/constants';
import { FormioBaseService } from '@core/services/formio-base.service';
import { Observable, Subscription } from 'rxjs';
import { first, take } from 'rxjs/operators';
import { uuidv4 } from "lib0/random";
import { lpClient } from "@core/services/oauth-client";
import { ServiceShare } from '@app/editor/services/service-share.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  // KeenThemes mock, change it to:
  defaultAuth: any = {
    email: 'admin@demo.com',
    password: 'demo',
  };
  loginForm!: FormGroup;
  hasError!: boolean;
  returnUrl!: string;
  isLoading$: Observable<boolean> = this._broadcaster.listen(CONSTANTS.SHOW_LOADER);
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private _broadcaster: BroadcasterService,
    public formioBaseService: FormioBaseService,
    private serviceShare: ServiceShare
  ) {
  }

  get f() {
    return this.loginForm.controls;
  }

  ngOnInit(): void {
    this.initForm();
    this.returnUrl = uuidv4();
    // this.route.snapshot.queryParams['returnUrl'.toString()] || '/';
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320),
        ]),
      ],
      password: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  submit() {
    this.hasError = false;
    this.serviceShare.ProsemirrorEditorsService.spinSpinner()
    let loginSub = this.authService.login({ [CONSTANTS.EMAIL]: this.f.email.value, [CONSTANTS.PASSWORD]: this.f.password.value })
    loginSub.pipe(first())
      .subscribe((user: UserModel) => {
        if (user) {
          setTimeout(()=>{
            this.router.navigate(['dashboard']);
            this.serviceShare.ProsemirrorEditorsService.stopSpinner()

          },2000)
          // this.formioBaseService.login();
        } else {
          this.hasError = true;
          this.serviceShare.ProsemirrorEditorsService.stopSpinner()

        }
      });
    loginSub.subscribe((data: any) => {
    })
  }

  signIn() {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner()
    lpClient.signIn().then(async signInResult => {
      if (signInResult) {
        const token: string = await lpClient.getToken();
        this.authService.storeToken('token', token);
        const loginSubscr = this.authService.getUserInfo().pipe(take(1))
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
        this.unsubscribe.push(loginSubscr);
      }
    }).catch(err => console.error(err));
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
