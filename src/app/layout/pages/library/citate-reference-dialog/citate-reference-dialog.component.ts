import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { styles } from '../data/styles';
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

  constructor(
    private serviceShare: ServiceShare,
    private cslService: CslService,
    private refsAPI:RefsApiService,
    public dialogRef: MatDialogRef<CitateReferenceDialogComponent>,
    private changeDetectorRef:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  ngAfterViewInit(): void {
    this.refsAPI.getReferences().subscribe((refs:any)=>{
      this.references = refs.data;
      this.changeDetectorRef.detectChanges()
    })
  }

  cancel() {
    this.dialogRef.close(undefined)
  }

  addReference() {
    let citateData = this.referencesControl.value.refData.basicCitation.bobliography
    this.dialogRef.close({
      ref:this.referencesControl.value,
      citateData
    })
  }
}
