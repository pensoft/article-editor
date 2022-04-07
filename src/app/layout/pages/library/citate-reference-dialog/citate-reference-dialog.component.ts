import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { styles } from '../data/styles';
import { CslService } from '../lib-service/csl.service';

@Component({
  selector: 'app-citate-reference-dialog',
  templateUrl: './citate-reference-dialog.component.html',
  styleUrls: ['./citate-reference-dialog.component.scss']
})
export class CitateReferenceDialogComponent implements AfterViewInit {

  references: any
  styles: any
  stylesControl = new FormControl(null, [Validators.required]);
  referencesControl = new FormControl(null, [Validators.required]);

  constructor(
    private serviceShare: ServiceShare,
    private cslService: CslService,
    public dialogRef: MatDialogRef<CitateReferenceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  ngAfterViewInit(): void {
    this.references = this.cslService.getRefsArray();
    this.styles = Object.keys(styles)
    console.log(this.references, this.styles);
  }

  cancel() {
    this.dialogRef.close(undefined)
  }

  addReference() {
    console.log(this.referencesControl.value,this.stylesControl.value);
    let citateData = this.cslService.genereteCitationStr(this.stylesControl.value,this.referencesControl.value);
    this.dialogRef.close({
      citateData
    })
  }
}
