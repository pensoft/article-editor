import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-jats-errors-dialog',
  templateUrl: './jats-errors-dialog.component.html',
  styleUrls: ['./jats-errors-dialog.component.scss']
})
export class JatsErrorsDialogComponent implements AfterViewInit {

  constructor(
    public dialogRef: MatDialogRef<JatsErrorsDialogComponent>,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: {errors:any[]}
    ) {

  }

  ngAfterViewInit(): void {
    this.data.errors = this.data.errors;
    this.ref.detectChanges()
  }

}
