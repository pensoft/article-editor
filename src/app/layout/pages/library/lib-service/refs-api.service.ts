import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RefsApiService {

  constructor(private _http: HttpClient,) {}

  getReferences(){
    return this._http.get('https://something/references');
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
