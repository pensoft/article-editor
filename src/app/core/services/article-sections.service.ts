import { Inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { map } from 'rxjs/operators';
import { APP_CONFIG, AppConfig } from '@core/services/app-config';


@Injectable({
  providedIn: 'root'
})

export class ArticleSectionsService {
  constructor(
    private _http: HttpClient,
    private serviceShare:ServiceShare,
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {
    this.serviceShare.shareSelf('ArticleSectionsService',this)
  }

  getArticleById(id: string) {
    return this._http.get(`${this.config.apiUrl}/articles/items/${id}`);
  }

  getLayoutById(id: string) {
    return this._http.get(`${this.config.apiUrl}/layouts/${id}`);
  }

  getSectionById(id:number){
      return this._http.get(`${this.config.apiUrl}/articles/sections/${id}`)
  }

  getAllSections(params: any) {
    return this._http.get(`${this.config.apiUrl}/articles/sections`, {params})
      .pipe(
        map((x: any) => ({
          data: x.data.filter(
            x => x.name != 'Figures'
              && x.name != 'References'
              && x.name != 'Tables'
              && x.name != 'SupplementaryMaterials'
              && x.name != 'Footnotes'
          )
        })
        )
      );
  }

  getAllLayouts(params?:any){
    return this._http.get(`${this.config.apiUrl}/layouts`,{params:{page:1,pageSize:100}})
  }
}
