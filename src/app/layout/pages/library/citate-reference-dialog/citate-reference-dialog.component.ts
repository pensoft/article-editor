import { HttpClient } from '@angular/common/http';
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

  references: any
  styles: any
  referencesControl = new FormControl(null, [Validators.required]);
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

  ngAfterViewInit(): void {
    this.refsAPI.getReferences().subscribe((refs: any) => {
      this.references = refs.data;
      this.changeDetectorRef.detectChanges()
    })
    fromEvent(this.searchInput!.nativeElement, 'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(400),
        distinctUntilChanged(),
        tap((text) => {
        })
      )
      .subscribe((data) => {
        this.searchExternalRefs(this.searchInput!.nativeElement.value)
      });
  }

  searchExternalRefs(searchText: string) {
    this.http.get('https://refindit.org/find', {
      headers: {
        'Access-Control-Allow-Origin':'*'
      },
      params: {
        search: 'simple',
        text: searchText,
      }
    }).subscribe((data) => {
      console.log(data);
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
      citateData
    })
  }
}
