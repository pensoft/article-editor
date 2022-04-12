import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-save',
  templateUrl: './save.component.html',
  styleUrls: ['./save.component.scss']
})
export class SaveComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<SaveComponent>) { }

  ngOnInit(): void {
  }

  save(globally:boolean){
    this.dialogRef.close({globally});
  }
}
