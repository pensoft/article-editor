import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';

@Injectable({
  providedIn: 'root'
})
export class RefsApiService {

  constructor(private _http: HttpClient,private serviceShare:ServiceShare) {}

  getReferences(){
    let obs = this._http.get('https://something/references')
    obs.subscribe((refsRes:any)=>{
      this.serviceShare.ReferencePluginService?.setRefs(refsRes.data);
    })
    return obs;
  }
  getReferenceTypes(){
    return this._http.get('https://something/references/types');
  }
  getStyles(){
    return this._http.get('https://something/references/styles');
  }
  createReference(ref:any){
    return this._http.post('https://something/references',{ref});
  }
  editReference(ref:any,global:boolean){
    return this._http.patch('https://something/references',{ref,global});
  }
  deleteReference(ref:any){
    return this._http.delete('https://something/references',{body:{ref}});
  }
}
