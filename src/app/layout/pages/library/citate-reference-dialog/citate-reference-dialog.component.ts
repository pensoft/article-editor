import { HttpClient } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { CslService } from '../lib-service/csl.service';
import { RefsApiService } from '../lib-service/refs-api.service';
import { environment } from '@env';
import { uuidv4 } from 'lib0/random';

@Component({
  selector: 'app-citate-reference-dialog',
  templateUrl: './citate-reference-dialog.component.html',
  styleUrls: ['./citate-reference-dialog.component.scss']
})
export class CitateReferenceDialogComponent implements AfterViewInit {
  loading = false;
  selected: any
  citating = false;
  displayedColumns = ['title']
  searchData: any
  references: any
  styles: any
  referencesControl = new FormControl(null);
  searchReferencesControl = new FormControl('');
  @ViewChild('searchInput') searchInput?: ElementRef;
  constructor(
    private serviceShare: ServiceShare,
    private cslService: CslService,
    private refsAPI: RefsApiService,
    public dialogRef: MatDialogRef<CitateReferenceDialogComponent>,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }
  lastSelect: 'external' | 'localRef' | 'none' = 'none';
  externalSelection: any
  select(row: any) {
    this.externalSelection = row;
    this.lastSelect = 'external';
  }

  ngAfterViewInit(): void {
    this.refsAPI.getReferences().subscribe((refs: any) => {
      this.references = refs.data;
      this.changeDetectorRef.detectChanges()
    })
    fromEvent(this.searchInput!.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(700),
        distinctUntilChanged(),
        tap((text) => {
        })
      )
      .subscribe((data) => {
        this.searchExternalRefs(this.searchInput!.nativeElement.value)
      });
  }

  mapRef(ref: any) {
    let maped: any = {};
    let formIOData: any = {}
    if (ref.authors && ref.authors instanceof Array && ref.authors.length > 0) {
      if (!maped['author']) {
        maped['author'] = []
        formIOData['authors'] = []
      }
      ref.authors.forEach((author: string[] | null | null[]) => {
        if (author && (author[0] || author[1])) {
          maped['author'].push({ "family": author[0] ? author[0] : '', "given": author[1] ? author[1] : '' })
          formIOData['authors'].push({
            "first": author[0] ? author[0] : '',
            "last": author[1] ? author[1] : '',
            "name": "",
            "role": "author",
            "type": "person"
          })
        }
      })
    }
    if (ref.firstauthor && ref.firstauthor instanceof Array && ref.firstauthor.length > 0) {
      if (!maped['author']) {
        maped['author'] = []
        formIOData['authors'] = []
      }
      ref.firstauthor.forEach((author: string[] | null | null[]) => {
        if (author && (author[0] || author[1])) {
          maped['author'].push({ "family": author[0] ? author[0] : '', "given": author[1] ? author[1] : '' })
          formIOData['authors'].push({
            "first": author[0] ? author[0] : '',
            "last": author[1] ? author[1] : '',
            "name": "",
            "role": "author",
            "type": "person"
          })
        }
      })
    }
    if (ref.doi) {
      maped['DOI'] = ref.doi
      formIOData['DOI'] = ref.doi
    }
    if (ref.href) {
      maped['URL'] = ref.href
      formIOData['URL'] = ref.href
    }
    if (ref.title) {
      maped['title'] = ref.title
      formIOData['title'] = ref.title
    }
    if (ref.year) {
      let val = `${ref.year}`;
      let dateParts = val.split('-')
      formIOData['issued'] = val
      if (dateParts.length == 1) {
        dateParts.push('1')
        dateParts.push('1')
      }
      if (dateParts.length == 2) {
        dateParts.push('1')
      }
      maped['issued'] = {
        "date-parts": [
          dateParts
        ]
      }
    }
    if (ref.publicationDate) {
      let val = `${ref.publicationDate}`
      let dateParts = val.split('-')
      formIOData['issued'] = val
      if (dateParts.length == 1) {
        dateParts.push('1')
        dateParts.push('1')
      }
      if (dateParts.length == 2) {
        dateParts.push('1')
      }
      maped['issued'] = {
        "date-parts": [
          dateParts
        ]
      }
    }
    if (ref.issue) {
      maped['issue'] = ref.issue
      formIOData['issue'] = ref.issue
    }
    if (ref.volume) {
      maped['volume'] = ref.volume
      formIOData['volume'] = ref.volume
    }
    if (ref.publishedIn) {
      maped['city'] = ref.publishedIn
      formIOData['city'] = ref.publishedIn
    }
    if (ref.abstract) {
      maped['abstract'] = ref.abstract
      formIOData['abstract'] = ref.abstract
    }
    if (ref.spage && ref.epage) {
      maped['page'] = ref.spage + '-' + ref.epage
      formIOData['page'] = ref.spage + '-' + ref.epage
    }
    if (ref.type) {
      maped['type'] = ref.type.replace(' ', '-').toLocaleLowerCase()
    } else {
      maped['type'] = 'article-journal'
    }
    if (ref.id) {
      if (ref.id instanceof String) {
        maped['id'] = ref.id
      } else if (typeof ref.id == 'object') {
        maped['id'] = Object.values(ref.id).join(':SePaRaToR:')
      } else {
        maped['id'] = ref.doi ? ref.doi : uuidv4()
      }
    } else {
      maped['id'] = ref.doi ? ref.doi : uuidv4()
    }

    return { ref: maped, formIOData }
  }

  searchExternalRefs(searchText: string) {
    this.searchData = undefined;
    this.loading = true;
    this.changeDetectorRef.detectChanges()
    let url = '/find'
    /* if(environment.production||true){
      url = 'https://refindit.org/find'
    } */
    //let exREFApi = 'https://api.refindit.org/find'
    this.http.get(environment.EXTERNAL_REFS_API, {
      responseType: 'text',

      params: {
        search: 'simple',
        text: searchText,
      }
    }).subscribe((data1) => {
      let parsedJson = JSON.parse(data1);
      if (parsedJson.length > 0) {
        this.searchData = parsedJson;
        this.loading = false;
        this.changeDetectorRef.detectChanges()
      }
      return
      let stringArray = data1.split('][').map((val, i) => {
        let newVal = val;
        if (!newVal.startsWith('[')) {
          newVal = '[' + newVal;
        }
        if (!newVal.endsWith(']')) {
          newVal = newVal + ']';
        }
        return newVal
      })
      let data: any[] = [];
      stringArray.forEach((str: string) => {
        data.push(...JSON.parse(str))
      })

      //map data in csl lib format
      let mapedReferences: any[] = []
      data.forEach((ref) => {
        let mapedRef = this.mapRef(ref)
        mapedReferences.push(mapedRef)
      })
      if (mapedReferences.length > 0) {
        this.searchData = mapedReferences;
        this.loading = false;
        this.changeDetectorRef.detectChanges()
      }
    })
  }

  cancel() {
    this.dialogRef.close(undefined)
  }

  addReference() {
    if (this.lastSelect == 'external') {
      this.citating  = true;
      this.changeDetectorRef.detectChanges()
      let styleName = 'demo-style'
      let externalRef = this.externalSelection.ref
      if (!externalRef.id) {
        externalRef.id = uuidv4()
      }
      let citation = this.cslService.genereteCitationStr(styleName, externalRef)
      this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
        this.refsAPI.getStyles().subscribe((refStyles: any) => {
          let typeName = this.externalSelection.ref.type?this.externalSelection.ref.type.split("-").join(" ").toLocaleUpperCase():''
          let type = this.externalSelection.ref.type
          let styleName = "demo-style";
          let typeIndex :any
          let styleIndex :any
          if (refTypes.data.find((ref:any) => {
            return (ref.name == typeName||ref.type == type)
          })) {
            typeIndex = refTypes.data.findIndex((ref:any) => {
              return (ref.name == typeName||ref.type == type)
            });
          }
          if (refStyles.data.find((style:any) => {
            return style.name == styleName
          })) {
            styleIndex = refStyles.data.findIndex((style:any) => {
              return style.name == styleName
            });
          }
          let ref: any = {
            refData: {
              basicCitation: citation,
              formioData: this.externalSelection.formIOData,
              last_modified: Date.now(),
              refType:'external',
              referenceData: this.externalSelection.ref
            },
            refStyle: {
              label: "Default Style",
              last_modified: Date.now(),
              name: "demo-style"
            },
            refType:{
              type: type?type:'',
              name: typeName,
              last_modified: (typeof typeIndex == 'number')?refTypes.data[typeIndex].last_modified:refTypes.data[0]?refTypes.data[0].last_modified:Date.now(),
            },
          }
          this.refsAPI.createReference(ref).subscribe((refs)=>{
            this.citating  = false;
            this.changeDetectorRef.detectChanges()
            this.dialogRef.close({
              ref: ref,
              refInstance: 'local',
              //externalSelect:this.selected,
              citation,

            })
          })
        })
      })
    } else if (this.lastSelect == 'localRef') {
      let localRef = this.referencesControl.value
      let citation = this.cslService.genereteCitationStr(localRef.refStyle.name, localRef.refData.referenceData)
      this.dialogRef.close({
        refInstance: 'local',
        ref: this.referencesControl.value,
        //externalSelect:this.selected,
        citation
      })
    }
  }
}
