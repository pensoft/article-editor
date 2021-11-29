import { AfterViewInit, Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { figure } from '../utils/interfaces/figureComponent';
import { YdocService } from './ydoc.service';

@Injectable({
  providedIn: 'root'
})
export class FiguresFormgroupsService  {

  figuresArray: figure[] = []

  figuresFormGroups:FormArray = new FormArray([])
  constructor(private ydocService: YdocService) {
    if (this.ydocService.editorIsBuild) {
      this.initFigureGroups()
    }
    this.ydocService.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        this.initFigureGroups()
      }
    });
  }


  initFigureGroups() {
    this.figuresArray = this.ydocService.figuresMap!.get('ArticleFigures');
    this.figuresArray.forEach((figure:any)=>{

      let formGroup = new FormGroup({});

      Object.keys(figure).forEach((key)=>{
        if(figure[key] instanceof Array){

          let formArr = new FormArray([])
          figure[key].forEach((component:any)=>{
            let componentGroup = new FormGroup({})
            Object.keys(component).forEach((key)=>{
              let fmControl = new FormControl(component[key])
              componentGroup.addControl(key,fmControl);
            })
            formArr.push(componentGroup)
          })
          formGroup.addControl(key,formArr);
        }else if(typeof figure[key] == 'string'){
          let fmControl = new FormControl(figure[key])

          formGroup.addControl(key,fmControl);
        }
      })
      this.figuresFormGroups.push(formGroup);
    })

    console.log(this.figuresFormGroups);
  }
}
