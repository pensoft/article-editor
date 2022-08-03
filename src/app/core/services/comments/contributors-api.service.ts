import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContributorsApiService {

  constructor(private http: HttpClient) { }

  getContributors(){
    return this.http.get('dqwdqw/get-contributors')
  }
}
