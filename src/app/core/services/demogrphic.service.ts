import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IDemographic } from '../interfaces/demographic.interface';

@Injectable({
  providedIn: 'root',
})
export class DemogrphicService {
  constructor(private http: HttpClient) {}

  public submitDemographicForm(demographicData: IDemographic){
    return this.http.post(`http://localhost:4200/profileData`, demographicData);
    // ne znam kam koi link da go post-na
  }
}
