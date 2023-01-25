import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@core/services/auth.service';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private readonly translate: TranslateService,
              private readonly toastr: ToastrService,
              private readonly authService: AuthService) {}

  public error422(error: HttpErrorResponse) {

    if(error.status === 500 && error.error.message.includes('Unauthenticated')){
      this.authService.logout();

      return;
    }

    const { errors } = error.error.error;
    const message: string = error.error.message;

    if (typeof errors === 'object') {
      const msg: string[] = [];
      Object.keys(errors).forEach((key: string) => {
        errors[key].forEach((message: string) => msg.push(message))
      })

      msg.forEach(err => this.toastr.error(err, this.translate.instant('ERRORS.error'), {
        positionClass: 'toast-bottom-center',
      }));
    } else if (typeof message === 'string') {
      this.toastr.error(message, this.translate.instant('ERRORS.error'), {
        positionClass: 'toast-bottom-center',
      });
    }
  }

  public error403(error: HttpErrorResponse) {
    const defaultError = this.translate.instant('ERRORS.HTTP_INTERCEPTOR.FORBIDDEN', {_default: 'Нямате нужните права за тази операция!'});
    if (error.error && error.error.message === 'Forbidden resource') error.error.message = defaultError;

    this.toastr.error(error.error.message || defaultError, this.translate.instant('ERRORS.error'), {
      positionClass: 'toast-bottom-center',
    });
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError( error => {
        switch (error.status) {
          case 422:
          case 500:
            this.error422(error);
            break;
          case 403:
            this.error403(error);
            break;
        }
        return throwError(error);
      })
    );
  }
}
