import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { articleSection, editorData, taxonomicCoverageContentData } from '../../utils/interfaces/articleSection';

@Injectable({
  providedIn: 'root'
})
export class EditSectionService {

  editChangeSubject:Subject<{ contentData:editorData|string|taxonomicCoverageContentData, sectionData: articleSection ,type:string}> = new Subject<{ contentData:editorData|string|editorData|taxonomicCoverageContentData, sectionData: articleSection ,type:string}>()

  constructor() { 
    
  }
  
}
