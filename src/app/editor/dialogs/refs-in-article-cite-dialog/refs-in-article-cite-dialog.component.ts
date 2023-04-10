import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { CiToTypes } from '@app/layout/pages/library/lib-service/editors-refs-manager.service';
import { Subject, Subscription } from 'rxjs';
import { YMap } from 'yjs/dist/src/internals';
import { RefsAddNewInArticleDialogComponent } from '../refs-add-new-in-article-dialog/refs-add-new-in-article-dialog.component';
import { clearRefFromFormControl } from '../refs-in-article-dialog/refs-in-article-dialog.component';
import { CdkDragEnter, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-refs-in-article-cite-dialog',
  templateUrl: './refs-in-article-cite-dialog.component.html',
  styleUrls: ['./refs-in-article-cite-dialog.component.scss']
})

export class RefsInArticleCiteDialogComponent implements OnInit,AfterViewInit, OnDestroy {
  refsInYdoc
  refMap: YMap<any>;
  addRefsThisSession:string[] = []
  checkedRefs: { text: string, refCitationID: string, citationStyle: number }[] = []
  CiToTypes = CiToTypes
  citationStyle = 0;
  citations = []
  isEditMode: boolean;

  @ViewChild('searchrefs', { read: ElementRef }) searchrefs?: ElementRef;
  searchControl = new FormControl('');
  citationStyleControl = new FormControl(0);

  ydocRefsSubject = new Subject<any>();
  subscription = new Subscription();

  constructor(
    private ydocService:YdocService,
    public dialogRef: MatDialogRef<RefsInArticleCiteDialogComponent>,
    public dialog: MatDialog,
    private ref:ChangeDetectorRef,
    private serviceShare:ServiceShare,
    @Inject(MAT_DIALOG_DATA) public data: { 
      data: { text: string, refCitationID: string, citationStyle: number }[], 
      citedRefsCiTOs: string[] | undefined, 
      isEditMode: boolean
    }
    ) {
    this.refMap = this.ydocService.referenceCitationsMap;
    this.refMap.observe(this.observeRefMapChanges)
    this.getRefsInYdoc()
  }

  openAddNewRefToEditorDialog() {
    const dialogRef = this.dialog.open(RefsAddNewInArticleDialogComponent, {
      panelClass: ['refs-add-new-in-article-dialog', 'editor-dialog-container'],
      //width: '100%',
      // height: '70%',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result instanceof Array) {
        result.forEach((refInstance) => {
          let refId = refInstance.ref.ref.id;
          this.refsInYdoc[refId] = refInstance.ref
          this.addRefsThisSession.push(refId);
          this.checkedRefs.push({ 
            text: refInstance.ref.citation.data[this.citationStyle].text,
            refCitationID: refInstance.ref.ref.id,
            citationStyle: this.citationStyle
          });
        })
        this.saveNewRefsInYdoc()
      }
    })
  }

  ngAfterViewInit(): void {
    if(!this.isEditMode) {
      this.searchrefs.nativeElement.focus();
    }
    this.ref.detectChanges();
  }

  saveNewRefsInYdoc(){
    let refsWithNoFormControls = clearRefFromFormControl(this.refsInYdoc);
    this.refMap.set('refsAddedToArticle', refsWithNoFormControls);
    setTimeout(()=>{
      this.serviceShare.EditorsRefsManagerService.updateRefsInEndEditorAndTheirCitations();
    },20)
  }

  observeRefMapChanges = (Yevent, tr) => {
    this.getRefsInYdoc()
  }

  getRefsInYdoc() {
    this.refsInYdoc = this.refMap.get('refsAddedToArticle');
    setTimeout(() => {
      this.passRefsToSubject()
    }, 20)
  }
  
  refsCiTOsControls:{[key:string]:FormControl} = {}
  passRefsToSubject() {
    let newRefs = this.refsInYdoc
    
    Object.values(newRefs).forEach((ref:any,i)=>{
      let formC:FormControl
      if(this.refsCiTOsControls[ref.ref.id]){
        formC = this.refsCiTOsControls[ref.ref.id]
      } else if (this.isEditMode) {
        formC = new FormControl(null);
        this.data.data.forEach((c, i) => {
          if(ref.ref.id == c.refCitationID) {
            formC.setValue((CiToTypes.find(t => t.label == this.data.citedRefsCiTOs[i])));
          }
        })
        this.refsCiTOsControls[ref.ref.id] = formC;
      } else{
        formC = new FormControl(CiToTypes.find(t => t.label == "None"));
        this.refsCiTOsControls[ref.ref.id] = formC
      }
      ref.refCiTOControl = formC
    })

    this.ydocRefsSubject.next([...Object.values(newRefs).filter((x:any)=>{
      if(!x.citation.textContent){
        let container = document.createElement('div');
        container.innerHTML = x.citation.bibliography;
        x.citation.textContent = container.textContent;
      }
      return x.citation.textContent.toLowerCase().includes(this.searchValue.toLowerCase());
    })]);
  }

  searchValue:string = ''
  ngOnInit(): void  {
    this.subscription.add(this.searchControl.valueChanges.subscribe((value)=>{
      this.searchValue = value
      this.passRefsToSubject()
    }))
    this.subscription.add(this.citationStyleControl.valueChanges.subscribe(value => this.changeCitationStyle(+value)));

    if(this.data.isEditMode){
      this.checkedRefs = this.data.data;
      this.citationStyle = +this.checkedRefs[0].citationStyle;
      this.citationStyleControl.setValue(this.citationStyle);
      this.isEditMode = true;
    }
  }

  ngOnDestroy(): void {
    this.refMap.unobserve(this.observeRefMapChanges);
    this.subscription.unsubscribe();
  }

  closeDialog(){
    this.dialogRef.close()
  }

  checkBoxChange(checked,ref){
    let refId = ref.ref.id
    if(checked){
      this.checkedRefs.push({ text: ref.citation.data[this.citationStyle].text, refCitationID: ref.ref.id, citationStyle: this.citationStyle });      
    }else{
      this.checkedRefs = this.checkedRefs.filter(c => c.refCitationID != refId);
      this.addRefsThisSession = this.addRefsThisSession.filter(x => x!=refId);
    }
  }

  deleteCitation(citationId: string) {
    this.checkedRefs = this.checkedRefs.filter(c => c.refCitationID != citationId);
  }

  changeCitationStyle(style: number) {
    let newCitations = [];

    this.checkedRefs.forEach(({ refCitationID }) => {
      newCitations.push({text: this.refsInYdoc[refCitationID].citation.data[style].text, refCitationID, citationStyle: style});
    })

    this.checkedRefs = newCitations;
    this.citationStyle = style;
  }

  isExist(ref) {
    return !!this.checkedRefs.find(c => c.refCitationID == ref.ref.id);
  }

  dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');
    phContainer.removeChild(phElement);
    phContainer.parentElement.insertBefore(phElement, phContainer);
    moveItemInArray(this.checkedRefs, dragIndex, dropIndex);    
  }
  
  citeSelectedRefs(){
    clearRefFromFormControl(this.refsInYdoc);
    
    this.dialogRef.close({ citedRefs: this.checkedRefs, isEditMode: this.isEditMode })
  }
}
