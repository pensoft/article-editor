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
import { Subscriber, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { RefsApiService } from './lib-service/refs-api.service';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryPage implements AfterViewInit {
  shouldRender = false;
  userReferences?: any[]
  displayedColumns: string[] = ['id', 'title', 'author', 'citate', 'edit', 'delete','updateScheme','updateStyle'];
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
          data: { possibleReferenceTypes: this.possibleReferenceTypes, referenceTypesFromBackend, oldData: editref,referenceStyles },
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
            this.editRef(refType, refStyle,formioData, editref,globally).subscribe((editRes)=>{
              this.userReferences = undefined;
              this.changeDetection.detectChanges();
              this.refsAPI.getReferences().subscribe((refs:any)=>{
                this.userReferences = refs.data;
                this.changeDetection.detectChanges();
              })
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
              this.userReferences = undefined;
              this.changeDetection.detectChanges();
              this.refsAPI.getReferences().subscribe((refs:any)=>{
                this.userReferences = refs.data;
                console.log(this.userReferences);
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
      this.userReferences = undefined
      this.changeDetection.detectChanges();
      this.refsAPI.getReferences().subscribe((refs:any)=>{
        this.userReferences = refs.data
        this.changeDetection.detectChanges();
      })
    })
  }

  addNewRef(refType:any, refStyle:any,formioData:any) {
    let  newRef = this.genereteNewReference(refType, formioData)
    return this.cslService.addReference(newRef, refType, refStyle,formioData)
  }

  editRef(refType:any, refStyle:any,formioData:any, oldRef:any,globally:boolean) {
    let newRef = this.genereteNewReference(refType, formioData)
    let refID = oldRef.refData.referenceData.id;
    newRef.id = refID;
    return this.cslService.addReference(newRef, refType, refStyle,formioData, oldRef,globally)
  }

  updateScheme(ref:any){
    console.log(ref);
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
  }

  updateStyle(ref:any){
    console.log(ref);
    let newRef = JSON.parse(JSON.stringify(ref));
    newRef.refStyle.last_modified = (new Date()).getTime();
    this.refsAPI.editReference(newRef,true).subscribe((res)=>{
      this.userReferences = undefined;
      this.changeDetection.detectChanges();
      this.refsAPI.getReferences().subscribe((refs:any)=>{
        this.userReferences = refs.data
        this.changeDetection.detectChanges();
      })
    })
  }

  genereteNewReference(refData: reference, data: any) {
    /* [ {
            "citationID": "SXDNEKR5AD",
            "citationItems": [{ "id": "2kntpabvm2" }],
            "properties": { "noteIndex": 1 }
          },[],[]] */
    /*
    {
      "type": "article-journal",
      "title": "Journal Title",
      "container-title": "Journal Name",
      "page": "427-454",
      "volume": "24",
      "issue": "3",
      "URL": "http://www.jstor.org/stable/173640",
      "DOI": "doi",
      "language": 'Publication language',
      "ISSN": "0022-0027",
      "author": [{ "family": "Mandel", "given": "Robert", "multi": { "_key": {} } }],
      "id": "2kntpabvm2"
    } */
    let newRefID = uuidv4();
    let newRef: any = {};
    let addCreator = (creator: any, type: string) => {
      if (!newRef[type]) {
        newRef[type] = []
      }
      newRef[type].push(creator)
    }
    let resolveCreators = (val: any, overRole?: string) => {
      val.forEach((creator: any) => {
        if (creator && typeof creator == 'object' && Object.keys(creator).length > 0) {
          let role = overRole ? overRole : creator.role ? creator.role : 'author';
          if (
            creator.type == 'person' &&
            ((creator.first && creator.first != '') || (creator.last && creator.last != ''))
          ) {
            addCreator({ "family": creator.first || '', "given": creator.last || '' }, role);
          } else if (
            creator.type == 'institution' &&
            (creator.name && creator.name != '')
          ) {
            addCreator({ "family": '', "given": creator.name }, role);
          } else if (creator.type == 'anonymous') {
            addCreator({ "family": 'Anonymous', "given": 'Anonymous' }, role);
          }
        }
      })
    }
    Object.keys(data).forEach((key) => {
      if (data[key]) {
        if (key == 'authors') {
          let val = data[key];
          resolveCreators(val)
        } else if (key == 'editor') {
          let val = data[key];
          resolveCreators(val, 'editor')
        } else if (key == 'issued') {
          let val = data[key];
          let dateParts = val.split('-')
          newRef[key] = {
            "date-parts": [
              dateParts
            ]
          }
        } else {
          let val = data[key];
          if (val && val !== '') newRef[key] = val;
        }
      }

    })
    /* refData.formFields.forEach((formField) => {
    }) */

    newRef.type = refData.type;
    newRef.id = newRefID;
    /* newRef = {
      "type": "article-journal",
      "multi": { "main": {}, "_keys": {} },
      "title": "Ottoman Tax Registers ( <i>Tahrir Defterleri</i> )",
      "container-title": "Historical Methods: A Journal of Quantitative and Interdisciplinary History",
      "page": "87-102",
      "volume": "37",
      "issue": "2",
      "source": "Crossref",
      "abstract": "The Ottoman government obtained current information on the empire’s sources of revenue through periodic registers called tahrir defterleri. These documents include detailed information on taxpaying subjects and taxable resources, making it possible to study the economic and social history of the Middle East and eastern Europe in the fifteenth and sixteenth centuries. Although the use of these documents has been typically limited to the construction of local histories, adopting a more optimistic attitude toward their potential and using appropriate sampling procedures can greatly increase their contribution to historical scholarship. They can be used in comprehensive quantitative studies and in addressing questions of broader historical significance or larger social scientific relevance.",
      "URL": "http://www.tandfonline.com/doi/abs/10.3200/HMTS.37.2.87-102",
      "DOI": "10.3200/HMTS.37.2.87-102",
      "ISSN": "0161-5440, 1940-1906",
      "language": "en",
      "author": [{ "family": "CoşGel", "given": "Metin M", "multi": { "_key": {} } }],
      "issued": {
        "date-parts": [
          ["2004", 4]
        ]
      },
      "accessed": {
        "date-parts": [
          ["2018", 6, 5]
        ]
      },
      "id" : "umk3nf9gqp"
    }*/
    return newRef
  }





  ngAfterViewInit(): void {
    this.refsAPI.getReferences().subscribe((refs:any)=>{
      this.shouldRender = true;
      this.userReferences = refs.data;
      console.log(this.userReferences);
      this.changeDetection.detectChanges();
    })
  }
}


