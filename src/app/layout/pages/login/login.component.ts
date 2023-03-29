import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { lpClient, ssoClient } from "@core/services/oauth-client";
import { ServiceShare } from '@app/editor/services/service-share.service';
import { HttpErrorResponse } from '@angular/common/http';
import { environment } from '@env';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  version = environment.VERSION;
  build_number = environment.BUILD_NUMBER;

  // KeenThemes mock, change it to:
  defaultAuth: any = {
    email: 'admin@demo.com',
    password: 'demo',
  };
  loginForm!: FormGroup;
  hasError!: boolean;
  returnUrl!: string;
  isLoading$: Observable<boolean> = this._broadcaster.listen(CONSTANTS.SHOW_LOADER);

  @ViewChild('errorContainer') errorContainer;
  errorText = '';
  passwordIsVisible = false;

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
    loginSub.subscribe({
      next: (value: any) => {
        if(value instanceof HttpErrorResponse){
          this.showError(value)
        }
      },
      error: (err: any) => {
        this.showError(err);
      },
    })
  }

  showError(error){
    this.errorText = error.error.message;
    this.errorContainer.nativeElement.style.opacity = 1;
    this.serviceShare.ProsemirrorEditorsService.stopSpinner();
    setTimeout(()=>{
      this.errorContainer.nativeElement.style.opacity = 0;
      this.errorText = ''
    },3000);
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

  /*async signIn() {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    try {
      console.log('START SIGNING');
      const signInResult = await lpClient.signIn();
      console.log('signInResult', signInResult);
      await this.processSigninResult(signInResult);
    } catch (e) {
      console.error(e);
    }
  }*/

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

  /*async orcidSignIn() {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    try {
      const signInResult = await ssoClient.signIn();
      await this.processSigninResult(signInResult);
    } catch (e) {
      console.error(e);
    }
  }*/

  async processSigninResult(signInResult){
    if(signInResult){
      const token = await lpClient.getToken();
      console.log('token', token);
      this.authService.storeToken(token);
      const loginSubscr = this.authService.getUserInfo(token).pipe(take(1))
        .subscribe((user: UserModel | undefined) => {
          if (user) {
            this.router.navigate(['/dashboard']);
            this.formioBaseService.login();
          } else {
            this.hasError = true;
          }
        });
    }
  }

  goToRegister() {
    window.location.href = `${environment.authServer}/register?return_uri=${encodeURIComponent(window.location.href)}`
  }
}
