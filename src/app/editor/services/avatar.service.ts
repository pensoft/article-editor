import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { IUserAvatar } from '@app/core/interfaces/avatar.interface';
import { Observable } from 'rxjs';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {


  constructor(private http: HttpClient, @Inject(APP_CONFIG) private config: AppConfig,) { }

  public getInfoByUser(id: string, email: string): Observable<IUserAvatar> {
    return this.http.get<IUserAvatar>(`${this.config.apiUrl}/users`)
  }
}
