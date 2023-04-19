import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatProgressBar } from '@angular/material/progress-bar';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { setBlockType } from 'prosemirror-commands';
import { Subject } from 'rxjs';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { PmDialogSessionService } from '../services/pm-dialog-session.service';
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

  donevalidationSubject?: Subject<any>

  displayErrors = false;

  constructor(
    private prosemirrorEditorsServise: ProsemirrorEditorsService,
    private treeService: TreeService,
    private articleSectionsService: ArticleSectionsService,
    private changeDetectorRef: ChangeDetectorRef,
    private ydocService: YdocService,
    //private pmSessionService:PmDialogSessionService,
  ) {
    //this.pmSessionService.hasDialogSession = false;
  }

  results = 0;

  articleValidations: validationResult[] = []
  articleFormFieldsValidation: validationResult[] = []
  nonCitedFiguresValidation: validationResult[] = []
  nonCitedTablesValidation: validationResult[] = []
  nonCitedSupplementaryFilesValidation: validationResult[] = []
  nonCitedEndNotesValidation: validationResult[] = []
  articleValidationsErrors: validationResult[] = []
  complexSectionsMinMaxErrors: validationResult[] = []
  nonCitedReferences: validationResult[] = []

  articleLength = 0;

  async validate() {
    this.spinnerComponent = true;
    this.displayErrors = false;
    this.articleValidations = []
    this.articleFormFieldsValidation = []
    this.nonCitedFiguresValidation = []
    this.nonCitedTablesValidation = []
    this.nonCitedSupplementaryFilesValidation = [];
    this.nonCitedEndNotesValidation = [];
    this.nonCitedReferences = []
    this.articleValidationsErrors = []
    this.complexSectionsMinMaxErrors = []
    this.results = 0;
    let loopFormGroupChildren = (form: FormGroup | FormArray, callback: (child: FormControl, key: string) => void) => {
      if (form instanceof FormGroup) {
        Object.keys(form.controls).forEach((key: any) => {
          let control = form.controls[key]
          if (control instanceof FormControl) {
            callback(control, key);
          } else {
            //@ts-ignore
            loopFormGroupChildren(control, callback)
          }
        })
      } else if (form instanceof FormArray) {
        form.controls.forEach((control, index: number) => {
          if (control instanceof FormControl) {
            callback(control, `${index}`);
          } else {
            //@ts-ignore
            loopFormGroupChildren(control, callback)
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
      let rules = JSON.parse(JSON.stringify(this.ydocService.articleData.layout.template.rules))
      let donevalidationSubject = new Subject();
      this.donevalidationSubject = donevalidationSubject
      rules.push({ rule: 'FormControls' })
      rules.push({ rule: 'CitatedFigures' })
      rules.push({ rule: 'ValidateComplexSections' })
      rules.push({ rule: 'ValidateCitedRefs' })
      rules.push({ rule: 'ValidateCitedTables' })
      rules.push({ rule: 'ValidateCitedSupplementaryFiles' })
      rules.push({ rule: 'ValidateEndNotes' })
      /* rules.push(
        {
          rule: 'SectionPosition',
          config: {
            names: 'Taxonomic coverage',
            expressions: `[{
              "rule":		"f.isAfter('Collection Data')",
              "errorMessage":	"Section of type 'Taxonomic coverage' cannot be before 'Collection Data' sections."
          },
          {
              "rule":		"f.sectionCount == 3",
              "errorMessage":	"There should be exactly 3 section of type 'Taxonomic Coverage' on the same tree level."
          }]`
          }
        }
      )
      rules.push(
        {
          rule: 'SectionPosition',
          config: {
            names: 'Collection Data',
            expressions: `[{
              "rule":		"f.isFirst()",
              "errorMessage":	"'Collection Data' section should be at the first posion on the level."
          }]`
          }
        }
      )
      rules.push(
        {
          rule: 'SectionPosition',
          config: {
            names: 'Subsection',
            expressions: `[{
              "rule":		"f.isLast()",
              "errorMessage":	"Section of type 'Subsection' should be on the last position on the level it's on."
          }]`
          }
        }
      ) */

      let validationsLength = rules.length;

      return new Promise((resolve, reject) => {
        let validatedCount = 0;

        donevalidationSubject.subscribe((data) => {
          if (data == 'cancel') {
            resolve('cancel')
          } else {
            validatedCount++;
            this.progress1 = (validatedCount / validationsLength) * 100;
            this.changeDetectorRef.detectChanges()
            if (validatedCount == validationsLength) {
              resolve(1);
            }

          }
        })


        let editorsContainers = this.prosemirrorEditorsServise.editorContainers;
        let symbolCount = 0;
        let loop = (sections: articleSection[]) => {
          sections.forEach((sec) => {
            if (sec.type == 'complex' && sec.children.length > 0) {
              loop(sec.children);
            }
            if (sec.active && sec.mode != 'noSchemaSectionMode') {
              let editorView = editorsContainers[sec.sectionID].editorView;
              symbolCount += editorView.state.doc.textContent.length;
            }
          })
        }
        loop(this.treeService.articleSectionsStructure!)
        this.articleLength = symbolCount
        this.articleSectionsService.getAllSections({ page: 1, pageSize: 999 }).subscribe((allSectionDataFromBackend) => {
          rules.forEach((el: { config: any, description: string, key: string, rule: String }, index: number) => {
            try {
              if (el.rule == "ToBeBetweenMinMax") {
                let min = +el.config.min
                let max = +el.config.max



                if (min > symbolCount || max < symbolCount) {
                  this.articleValidations.push({ fulfilled: false, errorMessage: `Number of characters in the article is not in the required range: ( minimum: ${min}, maximum: ${max})` })
                }
                donevalidationSubject.next(null)
              } else if (el.rule == "ToHaveMinMaxEqualSections") {
                let sectionNames = (el.config.names.split('|') as string[]).map((name: string) => { return name.trim() });

                let min = el.config.min;
                let max = el.config.max;
                let count = 0;
                let sectionCount = 0;
                let countSecNameWithExpression = (sections: articleSection[], name: string, callback: (section: articleSection) => boolean) => {
                  sections.forEach((sec) => {
                    if (sec.type == 'complex' && sec.children.length > 0) {
                      countSecNameWithExpression(sec.children, name, callback);
                    }
                    if (sec.title.name == name) {
                      sectionCount++;

                      if (callback(sec)) {
                        count++;
                      }
                    }
                  })
                }
                let formGroups = this.treeService.sectionFormGroups
                let expressionsObj
                try{
                  expressionsObj = JSON.parse(el.config.expressions)
                }catch(e){
                  expressionsObj = []
                  console.error(e);
                  console.error('Prop el.config.expressions in ',el)
                }
                let validataWithDataFromBackend = (data: any) => {
                  let allSectionNamesFromBackend = data.data.map((section: any) => {
                    return section.name;
                  })
                  sectionNames.forEach((secName) => {
                    if (allSectionNamesFromBackend.includes(secName)) {
                      sectionCount = 0;
                      count = 0;
                      let container = document.createElement('div');
                      let expressErrorMesages: string[] = []
                      countSecNameWithExpression(this.treeService.articleSectionsStructure!, secName,
                        (section: articleSection) => {
                          let formGroup = formGroups[section.sectionID];
                          let value = JSON.parse(JSON.stringify(formGroup.value));
                          let htmlToTextContent = (obj: any) => {
                            if (obj) {
                              Object.keys(obj).forEach((key) => {
                                if (typeof obj[key] == 'string' || typeof obj[key] == 'number') {
                                  container.innerHTML = obj[key]
                                  obj[key] = container.textContent;
                                } else {
                                  try {
                                    htmlToTextContent(obj[key]);
                                  } catch (e) {
                                    console.error(e);
                                  }
                                }
                                obj[key]
                              })
                            }
                          }
                          htmlToTextContent(value)
                          let returnVal = true;
                          expressionsObj.forEach((expr: { rule: string, errorMessage: string }) => {
                            let expFunc = Function('value', 'return ' + expr.rule);
                            let result = expFunc(value)
                            if (!result && !expressErrorMesages.includes(expr.errorMessage)) {
                              expressErrorMesages.push(expr.errorMessage)
                            }
                            returnVal = returnVal && result;
                          })
                          return returnVal
                        })
                      if (sectionCount == 0) {
                        if (min && max) {
                          if (min > count || max < count) {
                            this.articleValidations.push({
                              fulfilled: false, errorMessage:
                                `There are no active sections with name "${secName}" in the article. They should be no less than ${min} and no more that ${max}, and should meet the following conditions: (${expressionsObj.map((el: any) => el.errorMessage).join(' ')}).`
                            })
                          }
                        } else if (max) {
                          if (max < count) {
                            this.articleValidations.push({
                              fulfilled: false, errorMessage:
                                `There are no active sections with name "${secName}" in the article. They should be no more that ${max}, and should meet the following conditions: (${expressionsObj.map((el: any) => el.errorMessage).join(' ')}).`
                            })
                          }
                        } else if (min) {
                          if (min > count) {
                            this.articleValidations.push({
                              fulfilled: false, errorMessage:
                                `There are no active sections with name "${secName}" in the article. They should be no less than ${min} and should meet the following conditions: (${expressionsObj.map((el: any) => el.errorMessage).join(' ')}).`
                            })
                          }
                        }
                      } else {
                        if (min && max) {
                          if (min > count || max < count) {
                            this.articleValidations.push({ fulfilled: false, errorMessage: `Sections with name "${secName}" does not fulfill the conditions: (${expressErrorMesages.join(' ')}). Current count of sections that meet the conditions is ${count},they should be no less than ${min} and no more that ${max}.` })
                          }
                        } else if (max) {
                          if (max < count) {
                            this.articleValidations.push({ fulfilled: false, errorMessage: `Sections with name "${secName}" does not fulfill the conditions: (${expressErrorMesages.join(' ')}). Current count of sections that meet the conditions is ${count},they should be no more than ${max}.` })
                          }
                        } else if (min) {
                          if (min > count) {
                            this.articleValidations.push({ fulfilled: false, errorMessage: `Sections with name "${secName}" does not fulfill the conditions: (${expressErrorMesages.join(' ')}). Current count of sections that meet the conditions is ${count},they should be no less than ${min}.` })
                          }
                        }
                      }
                    }
                  })
                  donevalidationSubject.next(null)
                }
                validataWithDataFromBackend(allSectionDataFromBackend)

              } else if (el.rule == "ToHavEqualSectionPositions") {
                let sectionNames = (el.config.names.split('|') as string[]).map((name: string) => { return name.trim() });

                let sectionsWithWrongPositions = 0;
                let totalSections = 0;
                let countSecNameWithExpression = (sections: articleSection[], name: string, callback: (section: articleSection, secContainer: articleSection[]) => boolean) => {
                  sections.forEach((sec) => {
                    if (sec.type == 'complex' && sec.children.length > 0) {
                      countSecNameWithExpression(sec.children, name, callback);
                    }
                    if (sec.title.name == name) {
                      totalSections++;

                      if (!callback(sec, sections)) {
                        sectionsWithWrongPositions++;
                      }
                    }
                  })
                }

                let expressionsObj
                try{
                  expressionsObj = JSON.parse(el.config.expressions)
                }catch(e){
                  expressionsObj = []
                  console.error(e);
                  console.error('Prop el.config.expressions in ',el)
                }
                let validataWithDataFromBackend = (data: any) => {
                  let allSectionNamesFromBackend = data.data.map((section: any) => {
                    return section.name;
                  })
                  sectionNames.forEach((secName) => {
                    if (allSectionNamesFromBackend.includes(secName)) {
                      sectionsWithWrongPositions = 0;
                      totalSections = 0;
                      let container = document.createElement('div');
                      let expressErrorMesages: string[] = []
                      countSecNameWithExpression(this.treeService.articleSectionsStructure!, secName,
                        (section: articleSection, secContainer: articleSection[]) => {
                          let returnVal = true;
                          expressionsObj.forEach((expr: { rule: string, errorMessage: string }) => {

                            let expFunc = Function('f', 'return ' + expr.rule);
                            let result = expFunc(getPositionFunctions(section, secContainer))
                            if (!result && !expressErrorMesages.includes(expr.errorMessage)) {
                              expressErrorMesages.push(expr.errorMessage)
                            }
                            returnVal = returnVal && result;
                          })
                          return returnVal
                        })
                      if (sectionsWithWrongPositions !== 0) {
                        if (sectionsWithWrongPositions == 1) {
                          this.articleValidations.push({
                            fulfilled: false, errorMessage:
                              `There is ${sectionsWithWrongPositions} section with name "${secName}" that is not ordered properly. Order rules for this type of sections: (${expressionsObj.map((el: any) => el.errorMessage).join(' ')}).`
                          })
                        } else {
                          this.articleValidations.push({
                            fulfilled: false, errorMessage:
                              `There are ${sectionsWithWrongPositions} sections with name "${secName}" that are not ordered properly. Order rules for this type of sections: (${expressionsObj.map((el: any) => el.errorMessage).join(' ')}).`
                          })
                        }
                      }
                    }
                  })
                  donevalidationSubject.next(null)
                }
                validataWithDataFromBackend(allSectionDataFromBackend)
              } else if (el.rule == "FormControls") {

                let formGroups = this.treeService.sectionFormGroups
                let loop = (sections: articleSection[]) => {
                  sections.forEach((sec) => {
                    if (sec.type == 'complex' && sec.children.length > 0) {
                      loop(sec.children);
                    }
                    if (sec.active) {
                      let formGroup = formGroups[sec.sectionID];
                      loopFormGroupChildren(formGroup, (child: FormControl, key: string) => {
                        if (child.status == "INVALID") {
                          let errorStr = Object.keys(child.errors!).map((error) => { return child.errors![error].message }).join(' ');
                          
                          if(!errorStr) {
                            errorStr = 'This field is required!';
                          }
                          
                          if(sec.title.label.match(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g)) {
                           this.articleFormFieldsValidation.push({ fulfilled: false, errorMessage: `Content in "${sec.title.label.replace(/<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>/g, '')}". ${errorStr} `});
                          } else {
                            this.articleFormFieldsValidation.push({ fulfilled: false, errorMessage: `Content in "${sec.title.label}". ${errorStr} `});
                          }
                        }
                      });
                    }
                  })
                }
                loop(this.treeService.articleSectionsStructure!)
                donevalidationSubject.next(null)

              } else if (el.rule == "CitatedFigures") {
                let figures: { [key: string]: figure } = this.ydocService.figuresMap.get('ArticleFigures')
                let figuresNumbersFromYMap: string[] = this.ydocService.figuresMap.get('ArticleFiguresNumbers');

                Object.keys(figures).forEach((key) => {
                  if (figures[key].figurePlace == "endEditor") {
                    this.nonCitedFiguresValidation.push({ fulfilled: false, errorMessage: `Figure № ${figuresNumbersFromYMap.findIndex((el) => el == key) + 1} is not cited.` })
                  }
                })
                donevalidationSubject.next(null)
              } else if (el.rule == "ValidateComplexSections") {
                let articleSectionStructure = this.treeService.articleSectionsStructure;
                let validateComplexSecMinMax = (complexSection: articleSection, sectionsFromBackend: any) => {
                  let errors: string[] = []
                  let children = complexSection.children;
                  Object.keys(complexSection.subsectionValidations!).forEach((pivotId: any) => {
                    let subSecMinMax = complexSection.subsectionValidations![pivotId];
                    let countOfType = 0;

                    children.forEach((child) => {
                      if (child.pivotId == pivotId) {
                        countOfType++;
                      }
                    })
                    let sectionFromBackend = sectionsFromBackend.find((el: any) => {return (el.pivot_id == pivotId)})
                    if(sectionFromBackend){
                      let secName = sectionFromBackend.name
                      if (countOfType < subSecMinMax.min) {
                        errors.push(`Number of "${secName}" sections should be more than ${subSecMinMax.min - 1}`);
                      }
                      if (countOfType > subSecMinMax.max) {
                        errors.push(`Number of "${secName}" sections should be less than ${subSecMinMax.max + 1}`);
                      }
                    }else{
                      console.error('There is no section with this ID.')
                    }
                  })
                  if (errors.length > 0) {
                    this.complexSectionsMinMaxErrors.push({ fulfilled: false, errorMessage: `Complex section "${complexSection.title.label}" should match the required minimum and maximum validations. ${errors.join('. ')}` })
                  }
                }
                this.articleSectionsService.getAllSections({ page: 1, pageSize: 999 }).subscribe((resData: any) => {
                  let loopTree = (section: articleSection) => {
                    if (section.type == 'complex' && section.subsectionValidations && Object.keys(section.subsectionValidations).length > 0) {
                      validateComplexSecMinMax(section, resData.data);
                    }
                    section.type == 'complex' ? section.children.forEach((sec) => {
                      loopTree(sec);
                    }) : undefined
                  }
                  articleSectionStructure?.forEach((section) => {
                    loopTree(section)
                  })
                  donevalidationSubject.next(null)
                })
              } else if (el.rule == 'ValidateCitedRefs'){
                let refsInEndEditor = this.ydocService.referenceCitationsMap?.get('referencesInEditor');
                let citedRefsInArticle = this.ydocService.referenceCitationsMap.get('citedRefsInArticle');

                Object.keys(refsInEndEditor).forEach((refId)=>{
                  if(!citedRefsInArticle[refId]) {
                    let refText = refsInEndEditor[refId].citation.textContent;
                    this.nonCitedReferences.push({ fulfilled: false, errorMessage: `Reference "${refText}" is not cited.` });
                  }
                })
                donevalidationSubject.next(null)
              } else if (el.rule == 'ValidateCitedTables'){
                let tables = this.ydocService.tablesMap!.get('ArticleTables');
                let tablesNumbers = this.ydocService.tablesMap?.get('ArticleTablesNumbers');

                Object.keys(tables).forEach((key) => {                  
                  if (tables[key].tablePlace == "endEditor") {
                    this.nonCitedTablesValidation.push({ fulfilled: false, errorMessage: `Table № ${tablesNumbers.findIndex((el) => el == key) + 1} is not cited.` });
                  }
                })
                donevalidationSubject.next(null)
              } else if (el.rule == 'ValidateCitedSupplementaryFiles'){
                let supplementaryFiles = this.ydocService.supplementaryFilesMap!.get('supplementaryFiles');
                let supplementaryFilesNumbers = this.ydocService.supplementaryFilesMap?.get('supplementaryFilesNumbers');
                let citedSupplementaryFiles = this.ydocService.supplementaryFilesMap?.get('citedSupplementaryFiles');

                Object.keys(supplementaryFiles).forEach((key) => {                                    
                  if (!citedSupplementaryFiles[key]) {
                    this.nonCitedSupplementaryFilesValidation.push({ fulfilled: false, errorMessage: `Supplementary File № ${supplementaryFilesNumbers.findIndex((el) => el == key) + 1} is not cited.` });
                  }
                })
                donevalidationSubject.next(null)
              } else if (el.rule == 'ValidateEndNotes'){
                let endNotes = this.ydocService.endNotesMap!.get('endNotes');
                let endNotesNumbers = this.ydocService.endNotesMap?.get('endNotesNumbers');
                let endNotesCitations = this.ydocService.endNotesMap?.get('endNotesCitations');

                Object.keys(endNotes).forEach((key) => {                                    
                  if (!endNotesCitations[key]) {
                    this.nonCitedEndNotesValidation.push({ fulfilled: false, errorMessage: `EndNote № ${endNotesNumbers.findIndex((el) => el == key) + 1} is not cited.` });
                  }
                })
                donevalidationSubject.next(null)
              }
            } catch (e) {
              this.articleValidationsErrors.push({
                fulfilled: false, errorMessage:
                  `There was problem pocessing the validation : \n${JSON.stringify(el, undefined, '\t')}`
              })
              donevalidationSubject.next(null)
              console.error(e)
            }
          })
        })
      })
    }
    let validateData = await validAsync();
    if (validateData == 'cancel') {

    } else {
      this.displayErrors = true
      this.spinnerComponent = false
      clearInterval(this.intervalID)
      this.progress1 = 0;
      this.results += this.articleValidations.length;
      this.results += this.articleFormFieldsValidation.length;
      this.results += this.nonCitedFiguresValidation.length;
      this.results += this.nonCitedTablesValidation.length;
      this.results += this.nonCitedSupplementaryFilesValidation.length;
      this.results += this.nonCitedEndNotesValidation.length;
      this.results += this.nonCitedReferences.length;
      this.results += this.articleValidationsErrors.length;
      this.results += this.complexSectionsMinMaxErrors.length;
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

function getPositionFunctions(section: articleSection, sectionContainer: articleSection[]) {

  let sec = section;
  let secCont = sectionContainer;

  let indexOfSec = secCont.indexOf(sec);
  let functionObj = {
    isFirst: () => {
      let indexIsFirst = indexOfSec == 0;
      return indexIsFirst;
    },
    isLast: () => {
      let indexIsLast = indexOfSec == secCont.length - 1;
      return indexIsLast;
    },
    isAfter: (secToBeAfterName: string) => {
      let indexOfGiven = secCont.findIndex((sec) => { return sec.title.name == secToBeAfterName });

      let secIsAfterGiven = indexOfSec > indexOfGiven
      return secIsAfterGiven;
    },
    sectionCount: secCont.filter((section) => section.title.name == sec.title.name).length
  }
  return functionObj;
}

