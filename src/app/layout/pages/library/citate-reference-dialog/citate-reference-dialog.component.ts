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

@Component({
  selector: 'app-citate-reference-dialog',
  templateUrl: './citate-reference-dialog.component.html',
  styleUrls: ['./citate-reference-dialog.component.scss']
})
export class CitateReferenceDialogComponent implements AfterViewInit {
  loading = false;
  selected:any
  displayedColumns = ['title']
  searchData:any
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
  lastSelect:'external'|'localRef'|'none' = 'none';
  externalSelection:any
  select(row:any){
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

  searchExternalRefs(searchText: string) {
    this.searchData = undefined;
    this.loading = true;
    this.changeDetectorRef.detectChanges()
    this.http.get('/find', {
      responseType:'text',
      params: {
        search: 'simple',
        text: searchText,
      }
    }).subscribe((data1) => {
      let stringArray = data1.split('][').map((val,i)=>{
        let newVal = val;
        if(!newVal.startsWith('[')){
          newVal = '['+newVal;
        }
        if(!newVal.endsWith(']')){
          newVal = newVal+']';
        }
        return newVal
      })
      let data:any[] = [];
      stringArray.forEach((str:string)=>{
        data.push(...JSON.parse(str))
      })
      if(data){

        this.searchData = data;
        this.loading = false;

        this.changeDetectorRef.detectChanges()

      }
    })
  }

  cancel() {
    this.dialogRef.close(undefined)
  }

  addReference() {
    let newCitation = this.cslService.genereteCitationStr(this.referencesControl.value.refStyle.name, this.referencesControl.value.refData)
    let citateData = newCitation.bibliography;
    this.dialogRef.close({
      ref: this.referencesControl.value,
      //externalSelect:this.selected,
      citateData
    })
  }
}
