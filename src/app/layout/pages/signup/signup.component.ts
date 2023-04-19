import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import { ServiceShare } from '@app/editor/services/service-share.service';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { HttpErrorResponse } from '@angular/common/http';
import Packages from '../../../../../package.json';
import { OauthClient } from '@app/core/services/oauth-client';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  version = `${Packages.version}`;

  // KeenThemes mock, change it to:
  defaultAuth: any = {
    email: 'admin@demo.com',
    password: 'demo',
  };
  loginForm!: FormGroup;
  hasError!: boolean;
  @ViewChild('errorContainer') errorContainer;
  errorText = ''
  returnUrl!: string;
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  passwordIsVisible = false;

  constructor(
    private fb: FormBuilder,
    private prosemirrorEditorsSerive:ProsemirrorEditorsService,
    private authService: AuthService,
    private serviceShare:ServiceShare,
    private route: ActivatedRoute,
    private router: Router,
    private _broadcaster: BroadcasterService,
    public formioBaseService: FormioBaseService,
    private readonly oauthClient: OauthClient
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
    this.serviceShare.ProsemirrorEditorsService.spinSpinner()

    this.hasError = false;
    let registerSub = this.authService.register({
      [CONSTANTS.EMAIL]: this.f.email.value,
      [CONSTANTS.NAME]: this.f.name.value,
      [CONSTANTS.PASSWORD]: this.f.password.value
    })
    registerSub.pipe(first())
      .subscribe({next:(user: UserModel) => {
        if (user && user instanceof UserModel) {
          this.router.navigate(['dashboard']);
          // this.formioBaseService.login();
        } else {
          this.hasError = true;
        }
        this.serviceShare.ProsemirrorEditorsService.stopSpinner()

      },error:(error)=>{
        this.showError(error);
      }})
      registerSub.subscribe({
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
    this.prosemirrorEditorsSerive.stopSpinner();
    setTimeout(()=>{
      this.errorContainer.nativeElement.style.opacity = 0;
      this.errorText = ''
    },3000);
  }

  signIn() {
    this.oauthClient.lpClient.signIn().then(async signInResult => {
      if (signInResult) {
        const token: string = await this.oauthClient.lpClient.getToken();
        this.authService.storeToken(token);
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
    }).catch(err => console.error(err));
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
