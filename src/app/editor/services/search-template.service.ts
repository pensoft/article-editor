import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchTemplateService {
  private baseUrl = '';

  constructor(private http: HttpClient) { }

  public searchTopics(searchText: string): Observable<string> {
    return this.http.get<string>(`${this.baseUrl}?searchText=${searchText}`);

    //slagam primerno url
  }

}
