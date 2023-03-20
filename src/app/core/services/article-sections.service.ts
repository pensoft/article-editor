import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { environment } from '@env';
import { map } from 'rxjs/operators';
const API_ARTICLES_URL = environment.apiUrl+`/articles`
const API_ARTICLE_TEMPLATES_URL = environment.apiUrl+`/layouts`
@Injectable({
  providedIn: 'root'
})

export class ArticleSectionsService {
  constructor(private _http: HttpClient,private serviceShare:ServiceShare) {
    this.serviceShare.shareSelf('ArticleSectionsService',this)
  }

  getArticleById(id: string) {
    return this._http.get(API_ARTICLES_URL + `/items/${id}`);
  }

  getLayoutById(id: string) {
    return this._http.get(API_ARTICLE_TEMPLATES_URL + `/${id}`);
  }

  getSectionById(id:number){
      return this._http.get(`${API_ARTICLES_URL}/sections/${id}`)
  }

  getAllSections(params:any){
    return this._http.get(`${API_ARTICLES_URL}/sections`,{params}).pipe(map((x:any)=>{return {data:x.data.filter(x=>x.name != "Citable Elements Schemas")}}));
  }

  getAllLayouts(params?:any){
    return this._http.get(`${API_ARTICLE_TEMPLATES_URL}`,{params:{page:1,pageSize:100}})
  }
}
