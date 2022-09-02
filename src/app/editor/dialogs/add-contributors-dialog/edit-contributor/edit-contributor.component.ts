import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-contributor',
  templateUrl: './edit-contributor.component.html',
  styleUrls: ['./edit-contributor.component.scss']
})
export class EditContributorComponent implements AfterViewInit {

  roleControl = new FormControl('')

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
    this.roleControl.setValue(this.data.contrData.role)
  }

  removeCollaborator(){
    this.dialogRef.close({edited:true,removed:true})
  }

  editCollaborator(){
    this.dialogRef.close({edited:true,role:this.roleControl.value})
  }

}
