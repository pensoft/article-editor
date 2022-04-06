import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { reference } from '../data/data';

@Component({
  selector: 'app-select-reference',
  templateUrl: './select-reference.component.html',
  styleUrls: ['./select-reference.component.scss']
})
export class SelectReferenceComponent implements OnInit {

  referenceFormControl  = new FormControl(null,[Validators.required]);
  possibleReferenceTypes: reference[]

  constructor(
    public dialogRef: MatDialogRef<SelectReferenceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.possibleReferenceTypes = data.possibleReferenceTypes;
  }

  ngOnInit(): void {
  }

  makeSelection(){
    this.dialogRef.close(this.referenceFormControl.value)
  }

  cancelCreate(){
    this.dialogRef.close(null)
  }
}
