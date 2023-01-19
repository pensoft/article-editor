import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { RefsApiService } from '@app/layout/pages/library/lib-service/refs-api.service';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, startWith } from 'rxjs/operators';
import { environment } from '@env';

@Component({
  selector: 'app-refs-add-new-in-article-dialog',
  templateUrl: './refs-add-new-in-article-dialog.component.html',
  styleUrls: ['./refs-add-new-in-article-dialog.component.scss']
})
export class RefsAddNewInArticleDialogComponent implements OnInit {

  searchReferencesControl = new FormControl('');
  loading = false;
  searchData: any
  externalSelection: any
  lastSelect: 'external' | 'localRef' | 'none' = 'none';
  filteredOptions: Observable<any[]>;
  lastFilter = null;

  referenceFormControl = new FormControl(null, [Validators.required]);
  referenceTypesFromBackend
  referenceStyles
  stylesFormControl = new FormControl(null, [Validators.required]);
  dataSave:any
  formIOSchema: any = undefined;
  referenceForms: FormGroup = new FormGroup({})
  isModified
  isValid

  constructor(
    private refsAPI: RefsApiService,
    public dialogRef: MatDialogRef<RefsAddNewInArticleDialogComponent>,
    private serviceShare: ServiceShare,
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
  ) { }

  ngOnInit(): void {

    this.searchReferencesControl.valueChanges.pipe(
      filter(Boolean),
      debounceTime(700),
      distinctUntilChanged(),
    ).subscribe((value: any) => {
      if (this.externalSelection !== value) {
        this.searchExternalRefs(value);
      }
    });
  }

  generateFormIOJSON(type: any) {
    this.formIOSchema = undefined;
    this.changeDetectorRef.detectChanges()

    let newFormIOJSON = JSON.parse(JSON.stringify(type.formIOScheme));
    let oldFormIOData = this.dataSave
    newFormIOJSON.components.forEach((component:any)=>{
      let val = oldFormIOData?oldFormIOData[component.key]:undefined;
      if(val){
        component.defaultValue = val
      }
    })
    setTimeout(() => {
      newFormIOJSON.components = newFormIOJSON.components.filter((el)=>{return el.type!='button'&&el.action!="submit"});
      this.formIOSchema = newFormIOJSON;
      this.changeDetectorRef.detectChanges();
    }, 100)
    return
  }
  loadingRefDataFromBackend = false;
  tabChanged(change: MatTabChangeEvent) {
    if (change.index == 1) {
      this.loadingRefDataFromBackend = true;
      this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
        this.refsAPI.getStyles().subscribe((refStyles: any) => {
          this.referenceTypesFromBackend = refTypes.data;
          this.referenceStyles = refStyles.data;
          if(!this.referenceFormControl.value){
            this.referenceFormControl.setValue(this.referenceTypesFromBackend[0]);
          }else{
            this.referenceFormControl.setValue(this.referenceFormControl.value);

          }
          if(!this.stylesFormControl.value){
            this.stylesFormControl.setValue(this.referenceStyles[0]);
          }else{
            this.stylesFormControl.setValue(this.stylesFormControl.value);

          }
          this.loadingRefDataFromBackend = false;
          this.generateFormIOJSON(this.referenceFormControl.value)
        })
      })
    }
  }

  oldSub?: Subscription
  searchExternalRefs(searchText: string) {
    if (this.oldSub) {
      this.oldSub.unsubscribe()
    }
    this.searchData = undefined;
    this.loading = true;
    this.changeDetectorRef.detectChanges()
    this.oldSub = this.http.get(environment.EXTERNAL_REFS_API, {
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
    })
  }

  select(row: any, lastSelect) {
    this.lastSelect = lastSelect;
    this.externalSelection = row;
    console.log(this.lastSelect, this.externalSelection);
  }

  displayFn(option: any): string {
    if (option) {
      return option?.ref?.title || option?.refData?.referenceData?.title + ' | ' +
        (option?.refData?.formioData?.authors[0] ? (option?.refData?.formioData?.authors[0]?.first || option?.refData?.formioData?.authors[0]?.last || option?.refData?.formioData?.authors[0]?.given) : 'no name') + ' | ' +
        option.refData.referenceData.type;
    }
    return '';
  }

  onSubmit() {
    console.log(this.dataSave);
  }

  onChange(change: any) {
    if(change instanceof Event){

    }else{
      this.dataSave = change.data;
      this.isModified = change.isModified
      this.isValid = change.isValid
    }
  }

  addReFindItRef() {

  }
}
