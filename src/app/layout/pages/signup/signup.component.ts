import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {UserModel} from '@core/models/user.model';
import {AuthService} from '@core/services/auth.service';
import {BroadcasterService} from '@core/services/broadcaster.service';
import {CONSTANTS} from '@core/services/constants';
import {FormioBaseService} from '@core/services/formio-base.service';
import {Observable, Subscription} from 'rxjs';
import {first, take} from 'rxjs/operators';
import {uuidv4} from "lib0/random";
import {lpClient} from "@core/services/oauth-client";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  // KeenThemes mock, change it to:
  defaultAuth: any = {
    email: 'admin@demo.com',
    password: 'demo',
  };
  loginForm!: FormGroup;
  hasError!: boolean;
  returnUrl!: string;
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private _broadcaster: BroadcasterService,
    public formioBaseService: FormioBaseService
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
      name: [
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
    this.authService.register({
      [CONSTANTS.EMAIL]: this.f.email.value,
      [CONSTANTS.NAME]: this.f.name.value,
      [CONSTANTS.PASSWORD]: this.f.password.value
    })
      .pipe(first())
      .subscribe((user: UserModel) => {
        if (user) {
          this.router.navigate(['dashboard']);
          // this.formioBaseService.login();
        } else {
          this.hasError = true;
        }
      })
  }

  signIn() {
    lpClient.signIn().then(async signInResult => {
      console.log(signInResult);
      if (signInResult) {
        const token: string = await lpClient.getToken();
        this.authService.storeToken('token', token);
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
      }
    }).catch(err => console.log(err));
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
