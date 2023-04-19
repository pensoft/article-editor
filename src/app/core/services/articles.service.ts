import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {

  constructor(
    private _http: HttpClient,
    private serviceShare:ServiceShare,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {
    this.serviceShare.shareSelf('ArticlesService',this)
  }

  getAllArticles(params:any){
    return this._http.get(`${this.config.apiUrl}/articles/items`,{params})
  }

  getArticleByUuid(uuid:string){
    return this._http.get(`${this.config.apiUrl}/articles/items/uuid/${uuid}`)
  }

  putArticleById(articleId:number,name:string,oldArticleData:any){
    oldArticleData.name = name;
    oldArticleData.updated_at = new Date().toISOString();
    return this._http.put(`${this.config.apiUrl}/articles/items/${articleId}`,oldArticleData)
  }

  getArticleCollaboratorsData(id:string){
    return this._http.get(`${this.config.apiUrl}/articles/items/${id}`)
  }

  updateArticleUpdatedAt(oldArticleData:any){
    oldArticleData.updated_at = new Date().toISOString();
    return this._http.put(`${this.config.apiUrl}/articles/items/${oldArticleData.id}`,oldArticleData)
  }

  deleteArticleById(articleId:number){
    return this._http.delete(`${this.config.apiUrl}/articles/items/${articleId}`,{observe:'response'})
  }

  createArticle(name:string,layout_id:number){
    return this._http.post(`${this.config.apiUrl}/articles/items`,{name,layout_id});
  }
}
