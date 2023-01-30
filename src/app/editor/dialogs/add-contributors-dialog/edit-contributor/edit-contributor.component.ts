import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-contributor',
  templateUrl: './edit-contributor.component.html',
  styleUrls: ['./edit-contributor.component.scss']
})
export class EditContributorComponent implements AfterViewInit {

  accessControl = new FormControl('')

  selectOptions: any[] = [
    {
      name: 'Viewer'
    },
    {
      name: 'Commenter'
    },
    {
      name: 'Editor'
    },
  ]

  askremove = false;

  constructor(
    public dialogRef: MatDialogRef<EditContributorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngAfterViewInit(): void {
    this.accessControl.setValue(this.data.contrData.access)
  }

  removeCollaborator(){
    this.dialogRef.close({edited:true,removed:true})
  }

  editCollaborator(){
    this.dialogRef.close({edited:true,access:this.accessControl.value})
  }

}
