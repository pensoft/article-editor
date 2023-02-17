import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { YdocService } from '@app/editor/services/ydoc.service';
import { CiToTypes } from '@app/layout/pages/library/lib-service/editors-refs-manager.service';
import { Subject } from 'rxjs';
import { YMap } from 'yjs/dist/src/internals';
import { RefsAddNewInArticleDialogComponent } from '../refs-add-new-in-article-dialog/refs-add-new-in-article-dialog.component';
import { clearRefFromFormControl } from '../refs-in-article-dialog/refs-in-article-dialog.component';

interface refsObj{
  [key:string]:articleRef
}

interface articleRef{
  ref
}

@Component({
  selector: 'app-refs-in-article-cite-dialog',
  templateUrl: './refs-in-article-cite-dialog.component.html',
  styleUrls: ['./refs-in-article-cite-dialog.component.scss']
})

export class RefsInArticleCiteDialogComponent implements OnInit, OnDestroy {
  refsInYdoc
  refMap: YMap<any>;
  addRefsThisSession:string[] = []
  checkedRefs:string[] = []
  CiToTypes = CiToTypes

  ydocRefsSubject = new Subject<any>();

  searchControl = new FormControl('')

  constructor(
    ydocService:YdocService,
    public dialogRef: MatDialogRef<RefsInArticleCiteDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: {citedRefsAtPos?:string[]},
    ) {
    this.refMap = ydocService.referenceCitationsMap;
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
          this.checkedRefs.push(refId);
        })
        this.saveNewRefsInYdoc()
      }
    })
  }

  saveNewRefsInYdoc(){
    let refsWithNoFormControls = clearRefFromFormControl(this.refsInYdoc)
    this.refMap.set('refsAddedToArticle', refsWithNoFormControls);
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
      }else{
        formC = new FormControl(ref.refCiTO?this.CiToTypes.find(x=>x.label == ref.refCiTO.label):null);
        this.refsCiTOsControls[ref.ref.id] = formC
      }
      formC.valueChanges.subscribe((change)=>{
        this.saveNewRefsInYdoc()
      })
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
    this.searchControl.valueChanges.subscribe((value)=>{
      this.searchValue = value
      this.passRefsToSubject()
    })
    if(this.data.citedRefsAtPos){
      this.checkedRefs.push(...this.data.citedRefsAtPos)
    }
  }

  ngOnDestroy(): void {
    this.refMap.unobserve(this.observeRefMapChanges);
  }

  closeDialog(){
    this.dialogRef.close()
  }

  checkBoxChange(checked,ref){
    let refId = ref.ref.id
    if(checked){
      this.checkedRefs.push(refId);
    }else{
      this.checkedRefs = this.checkedRefs.filter(x => x!=refId);
      this.addRefsThisSession = this.addRefsThisSession.filter(x => x!=refId);
    }
  }

  citeSelectedRefs(){
    let refsWithNoFormControls = clearRefFromFormControl(this.refsInYdoc)
    this.dialogRef.close({citedRefs:this.checkedRefs,refsInYdoc:refsWithNoFormControls})
  }
}
