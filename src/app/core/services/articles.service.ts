import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
const API_ARTICLES_URL = `https://ps-article.dev.scalewest.com/api/articles`

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private _http: HttpClient,private serviceShare:ServiceShare) {
    this.serviceShare.shareSelf('ArticlesService',this)
  }

  getAllArticles(){
    return this._http.get(API_ARTICLES_URL,{params:{page:1,pageSize:100}})
  }

  getArticleByUuid(uuid:string){
    return this._http.get(`${API_ARTICLES_URL}/uuid/${uuid}`)
  }

  putArticleById(articleId:number,name:string,oldArticleData:any){ // article id !== uuid !
    oldArticleData.name = name;
    return this._http.put(`${API_ARTICLES_URL}/${articleId}`,oldArticleData)
  }

  deleteArticleById(articleId:number){ // article id !== uuid !
    return this._http.delete(`${API_ARTICLES_URL}/${articleId}`)
  }

  createArticle(name:string,layout_id:number){
    return this._http.post(API_ARTICLES_URL,{name,layout_id});
  }
}
