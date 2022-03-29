import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { countriesInfo } from '../../../assets/json/country';

@Injectable({
  providedIn: 'root',
})
export class CountriesService {

  constructor(private http: HttpClient) {}

  public getCountriesData():any {
    return this.http.get(`${countriesInfo}`);
  }
}
