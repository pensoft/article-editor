import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
@Component({
  selector: 'app-add-link-dialog',
  templateUrl: './add-link-dialog.component.html',
  styleUrls: ['./add-link-dialog.component.scss']
})
export class AddLinkDialogComponent implements AfterViewInit, OnDestroy{

  formGroup: FormGroup;
  @ViewChild('linkurlinput', { read: ElementRef }) linkurlinput?: ElementRef;

  get url() {
    return this.formGroup.get("url") as FormControl;
  }

  get text() {
    return this.formGroup.get("text") as FormControl;
  }

  constructor(public dialogRef: MatDialogRef<AddLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private ref:ChangeDetectorRef,
    private detectFocusService: DetectFocusService) {
      this.formGroup = new FormGroup({
        url: new FormControl(data.url || "", Validators.required),
        text: new FormControl(data.text || "", Validators.required)
      })
     }

  ngAfterViewInit(): void {
    this.detectFocusService.setSelectionDecorationOnLastSelecctedEditor();
    this.linkurlinput.nativeElement.focus()
    this.ref.detectChanges();
  }

  getErrorMessage() {
    if (this.formGroup.get("url").hasError('required') || this.formGroup.get("text").hasError('required')) {
      return 'You must enter a value';
    }

    return '';
  }

  ngOnDestroy(): void {
    this.detectFocusService.removeSelectionDecorationOnLastSelecctedEditor();
  }
}
