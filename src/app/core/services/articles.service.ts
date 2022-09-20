import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { environment } from '@env';
const API_ARTICLES_URL = environment.apiUrl+`/articles`

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(private _http: HttpClient,private serviceShare:ServiceShare) {
    this.serviceShare.shareSelf('ArticlesService',this)
  }

  getAllArticles(params:any){
    return this._http.get(API_ARTICLES_URL,{params})
  }

  getArticleByUuid(uuid:string){
    return this._http.get(`${API_ARTICLES_URL}/uuid/${uuid}`)
  }

  putArticleById(articleId:number,name:string,oldArticleData:any){ // article id !== uuid !
    oldArticleData.name = name;
    oldArticleData.updated_at = new Date().toISOString();
    return this._http.put(`${API_ARTICLES_URL}/${articleId}`,oldArticleData)
  }

  getArticleCollaboratorsData(id:string){
    return this._http.get(`${API_ARTICLES_URL}/${id}`)
  }

  updateArticleUpdatedAt(oldArticleData:any){
    oldArticleData.updated_at = new Date().toISOString();
    return this._http.put(`${API_ARTICLES_URL}/${oldArticleData.id}`,oldArticleData)
  }

  deleteArticleById(articleId:number){ // article id !== uuid !
    return this._http.delete(`${API_ARTICLES_URL}/${articleId}`,{observe:'response'})
  }

  createArticle(name:string,layout_id:number){
    return this._http.post(API_ARTICLES_URL,{name,layout_id});
  }
}
