import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { Subject } from 'rxjs';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { articleSection } from '../utils/interfaces/articleSection';
import { figure } from '../utils/interfaces/figureComponent';

interface validationResult { fulfilled: boolean, errorMessage: string };
@Component({
  selector: 'app-validation-section',
  templateUrl: './validation-section.component.html',
  styleUrls: ['./validation-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ValidationSectionComponent implements OnDestroy {
  spinnerComponent!: boolean;

  deg = 0;
  @ViewChild('spinner', { read: ElementRef }) spinnerEl?: ElementRef;

  intervalID: any;
  progress1 = 0;

  donevalidationSubject?:Subject<any>

  displayErrors = false;

  constructor(
    private ydocSetvice: YdocService,
    private prosemirrorEditorsServise: ProsemirrorEditorsService,
    private treeService: TreeService,
    private articleSectionsService: ArticleSectionsService,
    private changeDetectorRef:ChangeDetectorRef,
    private ydocService:YdocService,
  ) {

  }

  results = 0;

  articleValidations: validationResult[] = []
  articleFormFieldsValidation:validationResult[] = []
  nonCitedFiguresValidation:validationResult[] = []

  articleLength = 0;

  async validate() {
    this.spinnerComponent = true;
    this.displayErrors = false;
    this.articleValidations = []
    this.articleFormFieldsValidation = []
    this.nonCitedFiguresValidation = []
    this.results = 0;
    let loopFormGroupChildren = (form: FormGroup | FormArray,callback:(child:FormControl,key:string)=>void) => {
      if (form instanceof FormGroup) {
        Object.keys(form.controls).forEach((key: any) => {
          let control = form.controls[key]
          if (control instanceof FormControl) {
            callback(control,key);
          } else {
            //@ts-ignore
            loopFormGroupChildren(control,callback)
          }
        })
      } else if (form instanceof FormArray) {
        form.controls.forEach((control,index:number) => {
          if (control instanceof FormControl) {
            callback(control,`${index}`);
          } else {
            //@ts-ignore
            loopFormGroupChildren(control,callback)
          }
        })
      }
    }
    let validAsync = () => {
      this.intervalID = setInterval(() => {
        this.deg = this.deg + 30;
        if (this.deg == -360) {
          this.deg = 0;
        }
        (this.spinnerEl!.nativeElement as HTMLImageElement).style.webkitTransform = 'rotate(' + this.deg + 'deg)';
        //@ts-ignore
        (this.spinnerEl!.nativeElement as HTMLImageElement).style.mozTransform = 'rotate(' + this.deg + 'deg)';
        //@ts-ignore
        (this.spinnerEl!.nativeElement as HTMLImageElement).style.msTransform = 'rotate(' + this.deg + 'deg)';
        //@ts-ignore
        (this.spinnerEl!.nativeElement as HTMLImageElement).style.oTransform = 'rotate(' + this.deg + 'deg)';
        //@ts-ignore
        (this.spinnerEl!.nativeElement as HTMLImageElement).style.transform = 'rotate(' + this.deg + 'deg)';
      }, 100)
      let rules  = JSON.parse(JSON.stringify(this.ydocSetvice.articleData.template.rules))
      let donevalidationSubject = new Subject();
      this.donevalidationSubject = donevalidationSubject
      rules.push({ rule: 'FormControls' })
      rules.push({ rule: 'CitatedFigures' })
      let validationsLength = rules.length;

      return new Promise((resolve,reject)=>{
        let validatedCount = 0;
        donevalidationSubject.subscribe((data)=>{
          if(data == 'cancel'){
            resolve('cancel')
          }else {
            validatedCount ++ ;
            this.progress1 = (validatedCount / validationsLength)*100;
            this.changeDetectorRef.detectChanges()
            if(validatedCount == validationsLength){
              resolve(1);
            }

          }
        })
        rules.forEach((el: { config: any, description: string, key: string, rule: String }, index: number) => {
          if (el.rule == "ToBeBetweenMinMax") {
            let min = +el.config.min
            let max = +el.config.max
            let editorsContainers = this.prosemirrorEditorsServise.editorContainers;

            let symbolCount = 0;

            let loop = (sections: articleSection[]) => {
              sections.forEach((sec) => {
                if (sec.type == 'complex' && sec.children.length > 0) {
                  loop(sec.children);
                }
                if (sec.active) {
                  let editorView = editorsContainers[sec.sectionID].editorView;
                  symbolCount += editorView.state.doc.textContent.length;
                }
              })
            }
            loop(this.treeService.articleSectionsStructure!)

            if (min > symbolCount || max < symbolCount) {
              this.articleValidations.push({ fulfilled: false, errorMessage: `Number of characters in the article is not in the required range : ( minimum : ${min} , maximum : ${max})` })
            }
            this.articleLength = symbolCount
            donevalidationSubject.next(null)
          } else if (el.rule == "ToHaveMinMaxEqualSections") {
            let sectionNames = (el.config.names.split('|') as string[]).map((name: string) => { return name.trim() });

            let min = el.config.min;
            let max = el.config.max;

            let count = 0;
            let countSecName = (sections: articleSection[], name: string) => {
              sections.forEach((sec) => {
                if (sec.type == 'complex' && sec.children.length > 0) {
                  countSecName(sec.children, name);
                }
                if (sec.title.name == name) {
                  count++;
                }
              })
            }
            this.articleSectionsService.getAllSections({ page: 1, pageSize: 999 }).subscribe((data:any) => {
              let allSectionNamesFromBackend = data.data.map((section:any)=>{
                return section.name;
              })
              sectionNames.forEach((secName) => {
                if(allSectionNamesFromBackend.includes(secName)){
                  count = 0;
                  countSecName(this.treeService.articleSectionsStructure!, secName)
                  if (min > count || max < count) {
                    this.articleValidations.push({ fulfilled: false, errorMessage: `Sections with name "${secName}" should not be less that ${min} and more that ${max}.Current count of these sections in the article is ${count} .` })
                  }
                }
              })
              donevalidationSubject.next(null)
            })
          } else if (el .rule == "FormControls"){

            let formGroups = this.treeService.sectionFormGroups
            let loop = (sections: articleSection[]) => {
              sections.forEach((sec) => {
                if (sec.type == 'complex' && sec.children.length > 0) {
                  loop(sec.children);
                }
                if (sec.active) {
                  let formGroup = formGroups[sec.sectionID];
                  loopFormGroupChildren(formGroup,(child:FormControl,key:string)=>{
                    if(child.status == "INVALID"){
                      let errorStr = Object.keys(child.errors!).map((error)=>{return child.errors![error].message}).join('');
                      this.articleFormFieldsValidation.push({fulfilled:false,errorMessage:`${key} in "${sec.title.label}".${errorStr}`})
                    }
                  });
                }
              })
            }
            loop(this.treeService.articleSectionsStructure!)
            donevalidationSubject.next(null)

          } else if (el .rule == "CitatedFigures"){
            let figures: { [key: string]: figure }= this.ydocService.figuresMap!.get('ArticleFigures')
            let figuresNumbersFromYMap:string[] = this.ydocService.figuresMap?.get('ArticleFiguresNumbers');

            Object.keys(figures).forEach((key)=>{
              if(figures[key].figurePlace == "endEditor"){
                this.nonCitedFiguresValidation.push({fulfilled:false,errorMessage:`Figure № ${figuresNumbersFromYMap.findIndex((el)=>el == key)+1} is not cited.`})
              }
            })
            donevalidationSubject.next(null)
          }

        })
      })


    }
    let validateData = await validAsync()
    if(validateData == 'cancel'){

    }else{
      this.displayErrors = true
      this.spinnerComponent = false
      clearInterval(this.intervalID)
      this.progress1 = 0;
      this.results += this.articleValidations.length;
      this.results += this.articleFormFieldsValidation.length;
      this.results += this.nonCitedFiguresValidation.length;
      this.changeDetectorRef.detectChanges();
    }
  }
  ngOnDestroy(): void {
  }

  cancelValidation() {
    this.spinnerComponent = false;
    this.displayErrors = false;
    this.donevalidationSubject!.next('cancel')
    this.progress1 = 0;
    clearInterval(this.intervalID)
  }

}
/*  */
