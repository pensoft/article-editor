import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
@Component({
  selector: 'app-add-link-dialog',
  templateUrl: './add-link-dialog.component.html',
  styleUrls: ['./add-link-dialog.component.scss']
})
export class AddLinkDialogComponent  {

  text = new FormControl('', [Validators.required]);

  type :string
  constructor(public dialogRef: MatDialogRef<AddLinkDialogComponent>,
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
