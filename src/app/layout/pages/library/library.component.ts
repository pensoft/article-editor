import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { basicJournalArticleData, jsonSchemaForCSL, possibleReferenceTypes, exampleCitation,  lang as langData, reference, formioAuthorsDataGrid, formIOTextFieldTemplate } from './data/data';
import { ReferenceEditComponent } from './reference-edit/reference-edit.component';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDrawer } from '@angular/material/sidenav';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { uuidv4 } from 'lib0/random';
import { I } from '@angular/cdk/keycodes';
import { CslService } from './lib-service/csl.service';
import { Subscriber, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss']
})
export class LibraryPage implements AfterViewInit {
  shouldRender = false;
  userReferences: any[] = []
  displayedColumns: string[] = ['id','title','author','citate','edit','delete'];
  constructor(
    private _http: HttpClient,
    public serviceShare: ServiceShare,
    public dialog: MatDialog,
    private cslService: CslService,
    private changeDetection:ChangeDetectorRef
  ) {

  }
  possibleReferenceTypes: any[] = possibleReferenceTypes

  editReference(editref:any){
    this._http.get('https://something/references/types').subscribe((redData:any)=>{
      let referenceTypesFromBackend = redData.data;
      const dialogRef = this.dialog.open(ReferenceEditComponent, {
        data: { possibleReferenceTypes: this.possibleReferenceTypes,referenceTypesFromBackend,oldData:editref },
        panelClass: 'edit-reference-panel',
        width: 'auto',
        height: '90%',
        maxWidth: '100%'
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          let ref: reference = result.referenceData;
          let newData = result.submissionData;
          let oldRefId = editref.referenceData.id;
          this.editRef(ref, newData.data,oldRefId)
          this.userReferences = this.cslService.getRefsArray()
          this.changeDetection.detectChanges();
        }
      });
    })
  }

  deleteReference(ref:any){
    this.cslService.deleteCitation(ref.referenceData.id);
    this.userReferences = this.cslService.getRefsArray();
    this.changeDetection.detectChanges();
  }

  addNewRef(refData1: reference, data1: any){
    let {newRef,refData,data} = this.genereteNewReference(refData1,data1)
    this.cslService.addReference(newRef,refData,data)
  }

  editRef(refData1: reference, data1: any,id:string){
    let {newRef,refData,data} = this.genereteNewReference(refData1,data1)
    newRef.id = id;
    this.cslService.addReference(newRef,refData,data)
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
    Object.keys(data.keys).forEach((key)=>{
      if (data[key]) {
        if (key == 'authors') {
          let val = data[key];
          resolveCreators(val)
        } else if (key == 'editor') {
          let val = data[key];
          resolveCreators(val, 'editor')
        } else if (key == 'issued'){
          let val = data[key];
          let dateParts = val.split('-')
          newRef[key] = {
            "date-parts": [
              dateParts
            ]
          }
        }else {
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
    return {newRef,refData,data}
  }

  createReference(): void {
    this._http.get('https://something/references/types').subscribe((redData:any)=>{
      let referenceTypesFromBackend = redData.data;
      const dialogRef = this.dialog.open(ReferenceEditComponent, {
        data: { possibleReferenceTypes: this.possibleReferenceTypes,referenceTypesFromBackend },
        panelClass: 'edit-reference-panel',
        width: 'auto',
        height: '90%',
        maxWidth: '100%'
      });

      dialogRef.afterClosed().subscribe((result: any) => {
        if (result) {
          let ref: reference = result.referenceData;
          let newData = result.submissionData;
          this.addNewRef(ref, newData.data)
          this.userReferences = this.cslService.getRefsArray()
          this.changeDetection.detectChanges();
        }
      });
    })
  }



  ngAfterViewInit(): void {
    let sub : Subscription|undefined = undefined
    let getData = () => {
      this.shouldRender = true;
      this.userReferences = this.cslService.getRefsArray()
      this.changeDetection.detectChanges();
      if(sub){
        sub.unsubscribe();
      }
    }
    if(!this.serviceShare.YdocService!.editorIsBuild){
      sub = this.serviceShare.YdocService!.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          getData();
        }
      });
    }else{
      getData();
    }
  }
}


