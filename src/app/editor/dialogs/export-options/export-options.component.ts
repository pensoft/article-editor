import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddFilesComponent } from '@app/layout/pages/create-new-project/dialog-add-files/dialog-add-files.component';
import { EditBeforeExportComponent } from '../edit-before-export/edit-before-export.component';

@Component({
  selector: 'app-export-options',
  templateUrl: './export-options.component.html',
  styleUrls: ['./export-options.component.scss']
})
export class ExportOptionsComponent implements OnInit {

  selectedType: 'pdf' | 'rtf' | 'msWord' | 'jatsXml' = 'pdf';
  path = 'C:/users/User1/Descktop'
  constructor(private dialog:MatDialog) { }

  ngOnInit(): void {
  }

  openEditBeforeExport(selected:any){
    let dialogRef = this.dialog.open(EditBeforeExportComponent, {
      height: '95%',
      width: '100%',
      panelClass:'pdf-edit-and-preview',
      data:{selected}
    });
  }

}
