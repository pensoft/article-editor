import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ServiceShare } from '@app/editor/services/service-share.service';
const API_ARTICLES_URL = `https://ps-article.dev.scalewest.com/api/articles`
const API_ARTICLE_TEMPLATES_URL = `https://ps-article.dev.scalewest.com/api/articles/templates`
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

  getAllSections(){
    return this._http.get(`${API_ARTICLES_URL}/sections`)
  }

  getAllTemplates(){
    return this._http.get(`${API_ARTICLE_TEMPLATES_URL}`)
  }
}
