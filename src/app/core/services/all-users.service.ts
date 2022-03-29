import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const API_USERS_URL = `https://ps-article.dev.scalewest.com/api`;
@Injectable({
  providedIn: 'root',
})
export class AllUsersService {
  constructor(private http: HttpClient) {}

  public getAllUsers() {
    return this.http.get(`${API_USERS_URL}/users`);
  }

  public sendAllSelectContributers() {
   // return this.http.post(`${API_USERS_URL}/users/addList`,)
  }
}
