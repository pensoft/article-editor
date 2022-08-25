import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env';
const API_USERS_URL = environment.apiUrl;
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
