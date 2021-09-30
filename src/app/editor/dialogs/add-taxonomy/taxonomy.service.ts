import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DialogData } from 'src/app/editor/dialogs/add-taxonomy/add-taxonomy.component';

@Injectable({
  providedIn: 'root'
})
export class TaxonomyService {
  taxonomy = new BehaviorSubject({ rank: 'ranking', scientificName: 'sc name', commonName: 'common name' });
}
