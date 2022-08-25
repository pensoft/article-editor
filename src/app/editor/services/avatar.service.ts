import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IUserAvatar } from '@app/core/interfaces/avatar.interface';
import { Observable } from 'rxjs';
import { environment } from '@env';

const API_AUTH_USERS = environment.apiUrl+`/users`;
@Injectable({
  providedIn: 'root'
})
export class AvatarService {


  constructor(private http: HttpClient) { }

  public getInfoByUser(id: string, email: string): Observable<IUserAvatar> {
    return this.http.get<IUserAvatar>(`${API_AUTH_USERS}`)
  }
}
