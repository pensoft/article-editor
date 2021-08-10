import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

interface DialogData {
  url: string;
}

@Component({
  selector: 'app-angular-dialog',
  templateUrl: './angular-dialog.component.html',
  styleUrls: ['./angular-dialog.component.scss']
})


export class AngularDialogComponent {

  text = new FormControl('', [Validators.required]);

  type :string
  constructor(
    public dialogRef: MatDialogRef<AngularDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.type = data.type
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getErrorMessage() {
    if (this.text.hasError('required')) {
      return 'You must enter a value';
    }

    return '';
  }

}
