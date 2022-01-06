import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const API_ARTICLES_URL = `https://ps-article.dev.scalewest.com/api/articles`

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private _http: HttpClient,) { }

  getAllArticles(){
    return this._http.get(API_ARTICLES_URL)
  }

  getArticleByUuid(uuid:string){
    return this._http.get(`${API_ARTICLES_URL}/uuid/${uuid}`)
  }

  putArticleById(articleId:number,name:string){ // article id !== uuid !
    return this._http.put(`${API_ARTICLES_URL}/${articleId}`,{name})
  }
  createArticle(name:string,article_template_id:number){
    return this._http.post(API_ARTICLES_URL,{name,article_template_id});
  }
}
