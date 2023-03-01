import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import * as katex from 'katex';

interface DialogData {
  url: string;
}

@Component({
  selector: 'app-add-comment-dialog',
  templateUrl: './add-comment-dialog.component.html',
  styleUrls: ['./add-comment-dialog.component.scss']
})
export class AddCommentDialogComponent implements AfterViewInit {

  text = new FormControl('', [Validators.required]);
  mathType = new FormControl('', [Validators.required]);
  type: string
  @ViewChild('dialogInput', { read: ElementRef }) dialogInput?: ElementRef;

  mathPreviews = [];

  selectedMathExample = 'math_inline';

  constructor(
    public dialogRef: MatDialogRef<AddCommentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref:ChangeDetectorRef,
    private sanitizer: DomSanitizer) {
    this.type = data.type

    this.text.valueChanges.subscribe((katexFormula) => {
      this.mathPreviews = [];
      if (katexFormula) {
        let singleLineExample;
        try {
          const singlelineFormula = katex.renderToString(katexFormula)
          singleLineExample = {
            value: 'math_inline',
            html: "Lorem Ipsum lorem ipsum " + singlelineFormula + " lorem ipsum lorem ipsum.",
          }
          this.mathPreviews.push(singleLineExample);
          this.selectedMathExample = 'math_inline';
        } catch { }

        try {
          const multilineFormula = katex.renderToString(katexFormula, {
            displayMode: true,
          })
          const multilineExample = {
            value: 'math_display',
            html: "Lorem Ipsum lorem ipsum:" + multilineFormula + "ipsum lorem ipsum.",
          }
          this.mathPreviews.push(multilineExample);

          if (!singleLineExample) {
            this.selectedMathExample = 'math_display';
          }
        } catch { }
      }
    })
  }

  ngAfterViewInit(): void {
    this.dialogInput.nativeElement.focus()
    this.ref.detectChanges();
  }

  sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
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
