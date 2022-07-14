import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServiceShare } from '@app/editor/services/service-share.service';
const API_ARTICLES_URL = `https://ps-api.dev.scalewest.com/api/articles`
const API_ARTICLE_TEMPLATES_URL = `https://ps-api.dev.scalewest.com/api/layouts`
@Injectable({
  providedIn: 'root'
})

export class ArticleSectionsService {
  constructor(private _http: HttpClient,private serviceShare:ServiceShare) {
    this.serviceShare.shareSelf('ArticleSectionsService',this)
  }

  getSectionById(id:number){
    return this._http.get(`${API_ARTICLES_URL}/sections/${id}`)
  }

  getAllSections(params:any){
    return this._http.get(`${API_ARTICLES_URL}/sections`,{params})
  }

  getAllLayouts(params?:any){

    return this._http.get(`${API_ARTICLE_TEMPLATES_URL}`,{params:{page:1,pageSize:100}})
  }
}
