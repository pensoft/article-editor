import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YdocService } from '@app/editor/services/ydoc.service';
import { Subject } from 'rxjs';
import { YMap } from 'yjs/dist/src/internals';
import { RefsAddNewInArticleDialogComponent } from '../refs-add-new-in-article-dialog/refs-add-new-in-article-dialog.component';

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

  ydocRefsSubject = new Subject<any>();

  searchControl = new FormControl('')

  constructor(
    ydocService:YdocService,
    public dialogRef: MatDialogRef<RefsInArticleCiteDialogComponent>,
    public dialog: MatDialog,
    ) {
    this.refMap = ydocService.referenceCitationsMap;
    this.refMap.observe(this.observeRefMapChanges)
    this.getRefsInYdoc()
  }

  openAddNewRefToEditorDialog() {
    const dialogRef = this.dialog.open(RefsAddNewInArticleDialogComponent, {
      panelClass: 'refs-add-new-in-article-dialog',
      width: '70%',
      height: '70%',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result instanceof Array) {
        result.forEach((refInstance) => {
          let refId = refInstance.ref.ref.id;
          this.refsInYdoc[refId] = refInstance.ref
          this.addRefsThisSession.push(refId);
          this.checkedRefs.push(refId);
          this.saveNewRefsInYdoc()
        })
      }
    })
  }

  saveNewRefsInYdoc(){
    this.refMap.set('refsAddedToArticle',this.refsInYdoc)
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

  passRefsToSubject() {
    let newRefs = this.refsInYdoc
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
    console.log(checked,ref);
    console.log(this.checkedRefs);
  }

  citeSelectedRefs(){
    this.dialogRef.close({citedRefs:this.checkedRefs,refsInYdoc:this.refsInYdoc})
  }
}
