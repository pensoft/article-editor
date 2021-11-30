import { AfterViewInit, Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { figure, figure_component } from '../utils/interfaces/figureComponent';
import { YdocService } from './ydoc.service';

@Injectable({
  providedIn: 'root'
})
export class FiguresControllerService  {

  /* figuresArray: figure[] = []
  figuresFormGroups:FormArray = new FormArray([]) */

  figuresData:figure[] = []

  constructor(private ydocService: YdocService) {
    if (this.ydocService.editorIsBuild) {
      this.initFigures()
    } else {
      this.ydocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          this.initFigures()
        }
      });
    }
  }

  initFigures(){
    let figuresDataFromYjs = this.ydocService.figuresMap?.get('ArticleFigures');
    this.writeFiguresDataLocal(figuresDataFromYjs)
  }

  writeFiguresDataLocal(data:figure[]){
    this.figuresData = data
  }

  writeFiguresDataGlobal(data:figure[]){
    this.ydocService.figuresMap?.set('ArticleFigures',data);
    this.figuresData = data
    this.updateAllFigures()
  }

  updateAllFigures(){
    
  }
  updateSingleFigure(figureNumber:number){}
}
