import { Injectable } from '@angular/core';
// import { FormioAuthService } from '@formio/angular/auth';
// import { environment } from '@env';
// import { HttpClient } from '@angular/common/http';
// import { FormBuilderConfig } from '../../backoffice/articles/article-sections/components/form-builder/form-builder-config';

@Injectable({
  providedIn: 'root',
})
export class FormioBaseService {

  // constructor(public formioAuthService: FormioAuthService,
  //             private http: HttpClient) { }

  login(){
    // const { username, password } = environment.formio;
    // this.formioAuthService.onLoginSubmit({data: {email: username, password, submit: true}})
  }

  // create(payload){
  //   this.http.post(`${FormBuilderConfig.appUrl}/form`, payload)
  // }
}
