import {AfterViewChecked, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {countSectionFromBackendLevel, filterChooseSectionsFromBackend, filterSectionsFromBackendWithComplexMinMaxValidations, sectionChooseData} from '@app/editor/utils/articleBasicStructure';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-choose-section',
  templateUrl: './choose-section.component.html',
  styleUrls: ['./choose-section.component.scss']
})
export class ChooseSectionComponent implements OnInit,AfterViewChecked,OnDestroy {

  showError = false;
  sectionTemplates: sectionChooseData[] = [];
  searchResults: sectionChooseData[] = [];
  value = undefined
  @ViewChild('inputText', { read: ElementRef }) inputText?: ElementRef;

  //@ViewChild('getSectionsSpinner') getSectionsSpinner?: any;

  private searchSubscription?: Subscription;
  private readonly searchSubject = new Subject<string | undefined>();


  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<ChooseSectionComponent>,
    private ref:ChangeDetectorRef,
    private serviceShare:ServiceShare,
    @Inject(MAT_DIALOG_DATA) public data: { templates: sectionChooseData[], sectionlevel: number,node?:articleSection  },
  ) {

  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges()
  }

  ngOnInit(): void {

  }

  initialSectionResults: sectionChooseData[] = []
  compatibilitySectionsResults: sectionChooseData[] = []

  setResultsData(){
    this.initialSectionResults = this.searchResults.filter(x=>x.source == 'template')
    this.compatibilitySectionsResults = this.searchResults.filter(x=>x.source == 'backend')
  }

  ngAfterViewInit(): void {
    this.sectionTemplates = this.data.templates
    this.searchResults = this.data.templates
    this.setResultsData()
    this.ref.detectChanges()

    this.searchSubscription = this.searchSubject
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
    )
    .subscribe((val) => (this.search(val)));
    this.inputText.nativeElement.focus()
    this.ref.detectChanges();
  }


  chooseSection(val: any) {
    if (!val) {
      this.showError = true
      setTimeout(() => {
        this.showError = false
      }, 1000)
    } else {
      this.dialogRef.close(val)
    }
  }

  closeSectionChoose() {
    this.dialogRef.close()
  }

  passSearchVal(input: any){
    setTimeout(()=>{
      this.searchSubject.next(input.value)
    },10)
  }

  public search(value: any) {
    this.value = value;
      this.searchResults = this.sectionTemplates.filter(el=>el.name.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
    this.setResultsData()
    this.ref.detectChanges()
    /* if(this.data.sectionlevel == 0){

    }else{
      this.serviceShare.ArticleSectionsService!.getAllSections({page: 1, pageSize: 10,'filter[name]':value}).subscribe((response: any) => {
        let sectionTemplates1 = filterChooseSectionsFromBackend(this.data.node.compatibility, response.data)
        let sectionlevel = this.serviceShare.TreeService.getNodeLevel(this.data.node)
        let sectionTemplates = (sectionTemplates1 as any[]).filter((el: any) => {
          let elementLevel = countSectionFromBackendLevel(el)
          return (elementLevel + sectionlevel < 3);
        });
        sectionTemplates = filterSectionsFromBackendWithComplexMinMaxValidations(sectionTemplates, this.data.node,this.data.node.children);
        this.searchResults = sectionTemplates;
      })
    } */
  }

  public ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}
