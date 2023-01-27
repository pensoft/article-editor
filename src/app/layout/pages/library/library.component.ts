import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {  possibleReferenceTypes,  lang as langData, reference } from './data/data';
import { ReferenceEditComponent } from './reference-edit/reference-edit.component';

import { ServiceShare } from '@app/editor/services/service-share.service';
import { CslService } from './lib-service/csl.service';
import { BehaviorSubject } from 'rxjs';
import { RefsApiService } from './lib-service/refs-api.service';
import { genereteNewReference } from './lib-service/refs-funcs';
import { EnforcerService } from '@app/casbin/services/enforcer.service';
import { HasPermissionPipe } from '@app/casbin/permission-pipe/has-permission.pipe';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryPage implements AfterViewInit {
  shouldRender = false;
  private messageSource = new BehaviorSubject([]);
  userReferences?= this.messageSource.asObservable();
  displayedColumns: string[] = ['id', 'title', 'author', 'citate', 'edit', 'delete'/* ,'updateScheme','updateStyle' */];
  constructor(
    public serviceShare: ServiceShare,
    public dialog: MatDialog,
    private cslService: CslService,
    private refsAPI: RefsApiService,
    private changeDetection: ChangeDetectorRef,
    public enforcer: EnforcerService,
    public permissionPipe: HasPermissionPipe
  ) {
    this.serviceShare.ProsemirrorEditorsService.spinSpinner()
  }
  possibleReferenceTypes: any[] = possibleReferenceTypes

  editReference(editref: any) {
    this.refsAPI.getReferences().subscribe()
    this.refsAPI.getReferenceById(editref.refData.referenceData.id).subscribe((ref) => {
      this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
        this.refsAPI.getStyles().subscribe((refStyles: any) => {
          let referenceStyles = refStyles.data
          let referenceTypesFromBackend = refTypes.data;

          const dialogRef = this.dialog.open(ReferenceEditComponent, {
            data: { referenceTypesFromBackend, oldData: ref, referenceStyles },
            panelClass: 'edit-reference-panel',
            //width: '100%',
            // height: '90%',
            // maxWidth: '100%'
          });

          dialogRef.afterClosed().subscribe((result: any) => {
            if (result) {
              let refType: reference = result.referenceScheme;
              let refStyle = result.referenceStyle
              let formioData = result.submissionData.data;
              let globally = result.globally
              this.editRef(refType, refStyle, formioData, ref, globally).subscribe((editRes: any) => {
                // this.userReferences = undefined;
                this.refsAPI.getReferences().subscribe((refs: any) => {
                  this.messageSource.next(refs.data);
                  // this.userReferences = refs.data;
                })
                let reference = editRes.data.find((ref1: any) => ref1.refData.referenceData.id == ref.refData.referenceData.id)
                let containers = this.serviceShare.ProsemirrorEditorsService?.editorContainers!
                // find ref in the returned obj
                // edit all cetitaions of this reference in the editors
                this.serviceShare.YjsHistoryService.preventCaptureOfBigNumberOfUpcomingItems()
                //this.cslService.updateAllCitatsOfReferenceInAllEditors(containers, reference)
              })
            }
          })
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
          //width: '100%',
          // height: '90%',
          // maxWidth: '100%'
        });

        dialogRef.afterClosed().subscribe((result: any) => {
          if (result) {
            let refType: reference = result.referenceScheme;
            let refStyle = result.referenceStyle
            let formioData = result.submissionData.data
            this.addNewRef(refType, refStyle, formioData).subscribe((addres: any) => {
              // this.userReferences = undefined;
              this.changeDetection.detectChanges();
              this.refsAPI.getReferences().subscribe((refs: any) => {
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
    this.refsAPI.deleteReference(ref).subscribe(() => {
      // this.userReferences = undefined
      this.changeDetection.detectChanges();
      this.refsAPI.getReferences().subscribe((refs: any) => {
        // this.userReferences = refs.data
        this.messageSource.next(refs.data);
        this.changeDetection.detectChanges();
      })
    })
  }

  addNewRef(refType: any, refStyle: any, formioData: any) {
    let newRef = genereteNewReference(refType, formioData)
    return this.cslService.addReference(newRef, refType, refStyle, formioData)
  }

  editRef(refType: any, refStyle: any, formioData: any, oldRef: any, globally: boolean) {
    let newRef = genereteNewReference(refType, formioData)
    let refID = oldRef.refData.referenceData.id;
    newRef.id = refID;
    return this.cslService.addReference(newRef, refType, refStyle, formioData, oldRef, globally)
  }

  ngAfterViewInit(): void {
    this.refsAPI.getReferences().subscribe((refs: any) => {
      this.shouldRender = true;
      // this.userReferences = refs.data;
      this.messageSource.next(refs.data);
      this.changeDetection.detectChanges();
      this.serviceShare.ProsemirrorEditorsService.stopSpinner()
    })
  }
}


