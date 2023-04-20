import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

@Injectable({
  providedIn: 'root',
})
export class AllUsersService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig,
    ) {}

  public getAllUsers(params:{[key:string]:string|number}) {
    return this.http.get(`${this.config.authUrl}/users`,{params}).pipe(map((x:any)=>{return x.data||[]}));
  }

  public getAllUsersV2(params:{[key:string]:string|number}) {
    return this.http.get(`${this.config.authUrl}/users`,{params});
  }

  sendCommentMentionInformation(body:any){
    return this.http.post(`${this.config.apiUrl}/collaborators/comment`,body)
  }

  sendInviteInformation(body:any){
    return this.http.post(`${this.config.apiUrl}/collaborators/invite`,body)
  }
}
