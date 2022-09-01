import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { contributorData, searchData } from '@app/editor/dialogs/add-contributors-dialog/add-contributors-dialog.component';
import { environment } from '@env';
import { Observable, Subscriber } from 'rxjs';
const API_USERS_URL = environment.apiUrl;
@Injectable({
  providedIn: 'root',
})
export class AllUsersService {
  constructor(private http: HttpClient) {}

  public getAllUsers() {
    let AllUsersObservable = new Observable<contributorData[]>((sub)=>{
      setTimeout(() => {
        sub.next(searchData);
      }, 1000);
    })
    return AllUsersObservable /* this.http.get(`${API_USERS_URL}/users`); */
  }

  public sendAllSelectContributers() {
   // return this.http.post(`${API_USERS_URL}/users/addList`,)
  }
}
