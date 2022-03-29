import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IPermission } from '../interfaces/permission.interface';
import { ISingInEmails } from '../interfaces/sing-in-emails.interface';
import { UserModel } from '../models/user.model';

const API_URL = `https://ps-article.dev.scalewest.com/api`;

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(private http: HttpClient) {}

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
    return this.http.post<UserModel>(`${API_URL}/`, {
      setPassword,
      confirmPassword,
    });
    // ne znam koi link da sloja
  }
  public submitPermissionForm(model: IPermission) {
    console.log('---permissionData ' + model);
    console.dir('---permissionData ' + model);
    return this.http.post(`http://localhost:4200/profileData`, model);
    // ne znam kam koi link da go post-na
  }

  public deleteAccount() {
    return this.http.delete(`${API_URL}/users/{id}`);
    // bi trqbvalo tova da e linka
  }
}
