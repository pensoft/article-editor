import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-insert-diagram-dialog',
  templateUrl: './insert-diagram-dialog.component.html',
  styleUrls: ['./insert-diagram-dialog.component.scss']
})
export class InsertDiagramDialogComponent implements OnInit {

  diagramTypes: any[] = [{
    id: 0,
    value: 'pie',
    label: 'Pie Chart'
  }, {
    id: 1,
    value: 'linear',
    label: 'Linear Chart'
  }, {
    id: 2,
    value: 'bar',
    label: 'Bar Chart'
  }, {
    id: 3,
    value: 'periodic',
    label: 'Periodic Chart'
  }, {
    id: 4,
    value: 'bubble',
    label: 'Bubble Chart'
  }];

  constructor(
    private dialogRef: MatDialogRef<InsertDiagramDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(data: any) {
    this.dialogRef.close({ data });
  }
}
