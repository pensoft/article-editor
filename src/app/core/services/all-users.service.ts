import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable, Subscriber } from 'rxjs';
import { map } from 'rxjs/operators';
const API_USERS_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root',
})
export class AllUsersService {
  constructor(private http: HttpClient) {}

  public getAllUsers() {
    return this.http.get(`${API_USERS_URL}/users`).pipe(map((x:any)=>{return x.data||[]}));
  }

  sendCommentMentionInformation(body:any){
    return this.http.post(`${API_USERS_URL}/collaborators/comment`,body)
  }

  sendInviteInformation(body:any){
    return this.http.post(`${API_USERS_URL}/collaborators/invite`,body)
  }
}
