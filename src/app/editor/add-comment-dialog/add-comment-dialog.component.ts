import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import * as katex from 'katex';

interface DialogData {
  url: string;
}

@Component({
  selector: 'app-add-comment-dialog',
  templateUrl: './add-comment-dialog.component.html',
  styleUrls: ['./add-comment-dialog.component.scss']
})
export class AddCommentDialogComponent {

  text = new FormControl('', [Validators.required]);

  type: string

  mathType: string

  @ViewChild('mathPreview') mathPreview: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<AddCommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.type = data.type
    this.mathType = data.mathType

    this.text.valueChanges.subscribe((katexFormula) => {
      if (katexFormula) {
        katex.render(katexFormula, this.mathPreview.nativeElement, {
          displayMode: true,
          throwOnError: false,
        })
      }
    })
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
