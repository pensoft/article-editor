import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { harvardStyle } from '@app/layout/pages/library/lib-service/csl.service';
import { CiToTypes } from '@app/layout/pages/library/lib-service/editors-refs-manager.service';
import { RefsApiService } from '@app/layout/pages/library/lib-service/refs-api.service';
import { genereteNewReference } from '@app/layout/pages/library/lib-service/refs-funcs';
import { ReferenceEditComponent } from '@app/layout/pages/library/reference-edit/reference-edit.component';
import { Subject } from 'rxjs';
import { YMap } from 'yjs/dist/src/internals';
import { RefsAddNewInArticleDialogComponent } from '../refs-add-new-in-article-dialog/refs-add-new-in-article-dialog.component';

@Component({
  selector: 'app-refs-in-article-dialog',
  templateUrl: './refs-in-article-dialog.component.html',
  styleUrls: ['./refs-in-article-dialog.component.scss']
})
export class RefsInArticleDialogComponent implements OnDestroy {

  refMap: YMap<any>;
  refsInYdoc: any;
  changedOrAddedRefs: any = {};
  deletedRefsIds: string[] = [];
  loadingData = false;

  getCiTOCopy(cito:any){
    return {...cito}
  }

  ydocAndChangedRefsSubject = new Subject<any>();
  CiToTypes = CiToTypes

  constructor(
    public dialog: MatDialog,
    private refsAPI: RefsApiService,
    public dialogRef: MatDialogRef<RefsInArticleDialogComponent>,
    private serviceShare: ServiceShare
  ) {
    this.refMap = this.serviceShare.YdocService.referenceCitationsMap;
    this.refMap.observe(this.observeRefMapChanges)
    this.getRefsInYdoc()
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

  ngOnDestroy(): void {
    this.refMap.unobserve(this.observeRefMapChanges);
  }

  openAddNewRefToEditorDialog() {
    const dialogRef = this.dialog.open(RefsAddNewInArticleDialogComponent, {
      panelClass: ['editor-dialog-container', 'refs-add-new-in-article-dialog'],
      //width: '100%',
      // height: '70%',
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result instanceof Array) {
        result.forEach((refInstance) => {
          let refId = refInstance.ref.ref.id;
          this.changedOrAddedRefs[refId] = refInstance.ref
          if (this.deletedRefsIds.includes(refId)) {
            this.deletedRefsIds = this.deletedRefsIds.filter(id => id != refId);
          }
        })
        this.passRefsToSubject()
      }
    })
  }

  getRefsForCurrEditSession() {
    let newRefs = {};
    let deletedRefsIds = this.deletedRefsIds
    Object.entries(this.refsInYdoc).forEach((entry) => {
      if (!deletedRefsIds.includes(entry[0])) {
        newRefs[entry[0]] = entry[1];
      }
    })
    Object.entries(this.changedOrAddedRefs).forEach((entry) => {
      if (!deletedRefsIds.includes(entry[0])) {
        newRefs[entry[0]] = entry[1];
      }
    })
    return newRefs
  }

  refsCiTOsControls = {}

  passRefsToSubject() {
    let newRefs = this.getRefsForCurrEditSession();
    let refsToPass = [...Object.values(newRefs)]
    refsToPass.forEach((ref:any,i)=>{
      let formC
      if(this.refsCiTOsControls[ref.ref.id]){
        formC = this.refsCiTOsControls[ref.ref.id]
      }else{
        formC = new FormControl(this.CiToTypes.find(x=>x.label == ref.refCiTO.label),[Validators.required]);
        this.refsCiTOsControls[ref.ref.id] = formC
      }

      ref.refCiTOControl = formC
    })
    this.ydocAndChangedRefsSubject.next([...Object.values(newRefs)]);
  }

  saveRefsInArticle() {
    let newRefs = this.getRefsForCurrEditSession();
    let refsToPass = [...Object.values(newRefs)]
    refsToPass.forEach((ref:any,i)=>{
      if(ref.refCiTOControl){
        ref.refCiTO = ref.refCiTOControl.value;
        ref.refCiTOControl = undefined;
      }
    })
    this.refMap.set('refsAddedToArticle', newRefs);
    this.serviceShare.EditorsRefsManagerService.updateRefsInEndEditorAndTheirCitations();
    this.dialogRef.close()
  }

  cancelRefsInAfticleEdit() {
    this.dialogRef.close()
  }

  deleteRef(ref) {
    this.deletedRefsIds.push(ref.ref.id);
    this.passRefsToSubject();
  }

  preventClick(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }

  editRef(ref) {
    this.loadingData = true;
    this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
      this.refsAPI.getStyles().subscribe((refStyles: any) => {
        this.loadingData = false;
        let referenceStyles = refStyles.data
        let referenceTypesFromBackend = refTypes.data;
        let oldData = { refData: { formioData: ref.formIOData }, refType: ref.refType, refStyle: ref.refStyle,refCiTO:this.refsCiTOsControls[ref.ref.id]?this.refsCiTOsControls[ref.ref.id].value:ref.refCiTO }
        const dialogRef = this.dialog.open(ReferenceEditComponent, {
          data: { referenceTypesFromBackend, oldData, referenceStyles },
          panelClass: ['edit-reference-panel', 'editor-dialog-container'],
          //width: '100%',
          // height: '90%',
          // maxWidth: '100%'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          if (result) {
            let newRef = genereteNewReference(result.referenceScheme, result.submissionData.data)
            let refObj = { ref: newRef, formIOData: result.submissionData.data };
            let refStyle
            if (
              this.serviceShare.YdocService.articleData &&
              this.serviceShare.YdocService.articleData.layout.citation_style) {
              let style = this.serviceShare.YdocService.articleData.layout.citation_style
              refStyle = {
                "name": style.name,
                "label": style.title,
                "style": style.style_content,
                "last_modified": (new Date(style.style_updated).getTime())
              }
            } else {
              refStyle = {
                "name": "harvard-cite-them-right",
                "label": "Harvard Cite Them Right",
                "style": harvardStyle,
                "last_modified": 1649665699315
              }
            }
            refObj.ref.id = ref.ref.id
            let refBasicCitation:any = this.serviceShare.CslService.getBasicCitation(refObj.ref, refStyle.style);
            let container = document.createElement('div');
            container.innerHTML = refBasicCitation.bibliography;
            refBasicCitation.textContent = container.textContent;
            let refInstance = {
              ...refObj,
              citation: refBasicCitation,
              refType: result.referenceScheme,
              ref_last_modified:Date.now(),
              refCiTO:result.refCiTO,
              refStyle
            }
            if(this.refsCiTOsControls[ref.ref.id]){
              this.refsCiTOsControls[ref.ref.id].setValue(this.CiToTypes.find(x=>x.label == result.refCiTO.label))
            }
            let refId = refInstance.ref.id;
            this.changedOrAddedRefs[refId] = refInstance
            if (this.deletedRefsIds.includes(refId)) {
              this.deletedRefsIds = this.deletedRefsIds.filter(id => id != refId);
            }
            this.passRefsToSubject()
          }
        })
      })
    })
  }
}
