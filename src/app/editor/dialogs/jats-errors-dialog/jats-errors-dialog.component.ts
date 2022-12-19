import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-jats-errors-dialog',
  templateUrl: './jats-errors-dialog.component.html',
  styleUrls: ['./jats-errors-dialog.component.scss']
})
export class JatsErrorsDialogComponent implements AfterViewInit {

  constructor(
    public dialogRef: MatDialogRef<JatsErrorsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {errors:any[]}
    ) {

  }

  ngAfterViewInit(): void {
    this.data.errors = this.data.errors.map(x=>[x]);
  }

}
