import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  public has = value => object => Object.values(object)
    .some(v => v === value || v && typeof v === 'object' && this.has(value)(v));

  public filter = (array, value) => array.find(this.has(value));
}
