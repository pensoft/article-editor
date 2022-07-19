import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { basicJournalArticleData, jsonSchemaForCSL, possibleReferenceTypes, exampleCitation, lang as langData, reference, formioAuthorsDataGrid, formIOTextFieldTemplate } from './data/data';
import { ReferenceEditComponent } from './reference-edit/reference-edit.component';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { uuidv4 } from 'lib0/random';
import { I } from '@angular/cdk/keycodes';
import { CslService } from './lib-service/csl.service';
import {BehaviorSubject, Subscriber, Subscription} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RefsApiService } from './lib-service/refs-api.service';
import { styles, styles1 } from './data/styles';
import { genereteNewReference } from './lib-service/refs-funcs';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryPage implements AfterViewInit {
  shouldRender = false;
  private messageSource = new BehaviorSubject([]);
  userReferences? = this.messageSource.asObservable();
  displayedColumns: string[] = ['id', 'title', 'author', 'citate', 'edit', 'delete'/* ,'updateScheme','updateStyle' */];
  constructor(
    public serviceShare: ServiceShare,
    public dialog: MatDialog,
    private cslService: CslService,
    private refsAPI:RefsApiService,
    private changeDetection: ChangeDetectorRef
  ) {

  }
  possibleReferenceTypes: any[] = possibleReferenceTypes

  editReference(editref: any) {
    this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
      this.refsAPI.getStyles().subscribe((refStyles: any) => {
        let referenceStyles = refStyles.data
        let referenceTypesFromBackend = refTypes.data;
        const dialogRef = this.dialog.open(ReferenceEditComponent, {
          data: { referenceTypesFromBackend, oldData: editref,referenceStyles },
          panelClass: 'edit-reference-panel',
          width: 'auto',
          height: '90%',
          maxWidth: '100%'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          if (result) {
            let refType: reference = result.referenceScheme;
            let refStyle = result.referenceStyle
            let formioData = result.submissionData.data;
            let globally = result.globally
            let newRef = genereteNewReference(refType, formioData)
            let refID = editref.refData.referenceData.id;
            this.editRef(refType, refStyle,formioData, editref,globally).subscribe((editRes)=>{
              // this.userReferences = undefined;
              this.changeDetection.detectChanges();
              this.refsAPI.getReferences().subscribe((refs:any)=>{
                this.messageSource.next(refs.data);
                // this.userReferences = refs.data;
                this.changeDetection.detectChanges();
              })
            })
            this.cslService.addReference(newRef, refType, refStyle, formioData, editref, globally).subscribe((editRes:any) => {
              let reference = editRes.data.find((ref1:any)=>ref1.refData.referenceData.id == editref.refData.referenceData.id)
              let containers = this.serviceShare.ProsemirrorEditorsService?.editorContainers!
              // find ref in the returned obj
              // edit all cetitaions of this reference in the editors
              this.serviceShare.YjsHistoryService.preventCaptureOfBigNumberOfUpcomingItems()
              this.cslService.updateAllCitatsOfReferenceInAllEditors(containers,reference)
            })
          }
        })
      })
    })
  }
  createReference(): void {
    this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
      this.refsAPI.getStyles().subscribe((refStyles: any) => {
        let referenceStyles = refStyles.data
        let referenceTypesFromBackend = refTypes.data;
        const dialogRef = this.dialog.open(ReferenceEditComponent, {
          data: { possibleReferenceTypes: this.possibleReferenceTypes, referenceTypesFromBackend, referenceStyles },
          panelClass: 'edit-reference-panel',
          width: 'auto',
          height: '90%',
          maxWidth: '100%'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          if (result) {
            let refType: reference = result.referenceScheme;
            let refStyle = result.referenceStyle
            let formioData = result.submissionData.data
            this.addNewRef(refType, refStyle,formioData).subscribe((addres:any)=>{
              // this.userReferences = undefined;
              this.changeDetection.detectChanges();
              this.refsAPI.getReferences().subscribe((refs:any)=>{
                // this.userReferences = refs.data;
                this.messageSource.next(refs.data);
                this.changeDetection.detectChanges();
              })
            })
          }
        })
      })
    })
  }

  deleteReference(ref: any) {
    //this.cslService.deleteCitation(ref.referenceData.id);
    this.refsAPI.deleteReference(ref).subscribe(()=>{
      // this.userReferences = undefined
      this.changeDetection.detectChanges();
      this.refsAPI.getReferences().subscribe((refs:any)=>{
        // this.userReferences = refs.data
        this.messageSource.next(refs.data);
        this.changeDetection.detectChanges();
      })
    })
  }

  addNewRef(refType:any, refStyle:any,formioData:any) {
    let  newRef = genereteNewReference(refType, formioData)
    return this.cslService.addReference(newRef, refType, refStyle,formioData)
  }

  editRef(refType:any, refStyle:any,formioData:any, oldRef:any,globally:boolean) {
    let newRef = genereteNewReference(refType, formioData)
    let refID = oldRef.refData.referenceData.id;
    newRef.id = refID;
    return this.cslService.addReference(newRef, refType, refStyle,formioData, oldRef,globally)
  }

  /* updateScheme(ref:any){
    let newRef = JSON.parse(JSON.stringify(ref));
    newRef.refType.last_modified = (new Date()).getTime();
    this.refsAPI.editReference(newRef,true).subscribe((res)=>{
      this.userReferences = undefined;
      this.changeDetection.detectChanges();
      this.refsAPI.getReferences().subscribe((refs:any)=>{
        this.userReferences = refs.data
        this.changeDetection.detectChanges();
      })
    })
  } */

  /* updateStyle(ref:any){
    let newRef = JSON.parse(JSON.stringify(ref));
    newRef.refStyle.last_modified = (new Date()).getTime();
    let styleName = newRef.refStyle.name;
    styles1[styleName] = styles[Object.keys(styles)[Math.floor((Math.random()*Object.keys(styles).length))]]
    this.refsAPI.editReference(newRef,true).subscribe((res)=>{
      this.userReferences = undefined;
      this.changeDetection.detectChanges();
      this.refsAPI.getReferences().subscribe((refs:any)=>{
        this.userReferences = refs.data
        this.changeDetection.detectChanges();
      })
    })
  } */



  ngAfterViewInit(): void {
    this.refsAPI.getReferences().subscribe((refs:any)=>{
      this.shouldRender = true;
      // this.userReferences = refs.data;
      this.messageSource.next(refs.data);
      this.changeDetection.detectChanges();
    })
  }
}


