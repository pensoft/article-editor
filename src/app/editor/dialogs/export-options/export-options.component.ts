import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { DialogAddFilesComponent } from '@app/layout/pages/create-new-project/dialog-add-files/dialog-add-files.component';
import { EditBeforeExportComponent } from '../edit-before-export/edit-before-export.component';
import { ExportJsonLdComponent } from '../export-json-ld/export-json-ld.component';
import { exportAsJatsXML } from './jatsXML/exportAsJatsXML';

@Component({
  selector: 'app-export-options',
  templateUrl: './export-options.component.html',
  styleUrls: ['./export-options.component.scss']
})
export class ExportOptionsComponent implements OnInit {

  selectedType: 'pdf' | 'rtf' | 'msWord' | 'jatsXml' | 'json-ld' = 'pdf';
  path = 'C:/users/User1/Descktop'
  constructor(private dialog:MatDialog,private sharedService:ServiceShare) { }

  ngOnInit(): void {
  }

  openEditBeforeExport(selected:any){
    if(selected == 'pdf'){
      let dialogRef = this.dialog.open(EditBeforeExportComponent, {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '97%',
        width: '97%',
        panelClass:'pdf-edit-and-preview',
        data:{selected}
      });
    }else if(selected == 'json-ld'){
      let dialogRef = this.dialog.open(ExportJsonLdComponent, {
        maxWidth: '100vw',
        maxHeight: '100vh',
        height: '97%',
        width: '97%',
        panelClass:'pdf-edit-and-preview',
        data:{selected}
      });
    }else if(selected == 'jatsXml'){
      exportAsJatsXML(this.sharedService);
    }
  }

}
