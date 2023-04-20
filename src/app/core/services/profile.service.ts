import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPermission } from '../interfaces/permission.interface';
import { ISingInEmails } from '../interfaces/sing-in-emails.interface';
import { UserModel } from '../models/user.model';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private http: HttpClient,
    @Inject(APP_CONFIG) private config: AppConfig,
    ) {}

  public getOtherEmailsInfo(
    img: string,
    email: string
  ): Observable<ISingInEmails> {
    return this.http.get<ISingInEmails>(``, {});
    // ne znam koi link da sloja
  }

  public getOnlyOtherEmails(email: string): Observable<ISingInEmails> {
    return this.http.get<ISingInEmails>(``, {});
    // ne znam koi link da sloja
  }

  public changePassword(
    setPassword: string,
    confirmPassword: string
  ): Observable<UserModel> {
    return this.http.post<UserModel>(`${this.config.apiUrl}/`, {
      setPassword,
      confirmPassword,
    });
  }
  public submitPermissionForm(model: IPermission) {
    return this.http.post(`${this.config.apiUrl}/profileData`, model);
  }

  public deleteAccount() {
    return this.http.delete(`${this.config.apiUrl}/users/{id}`);
  }
}
