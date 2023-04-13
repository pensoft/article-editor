import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { Node } from 'prosemirror-model';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { supplementaryFile } from '@app/editor/utils/interfaces/supplementaryFile';
import { AddSupplementaryFileComponent } from './add-supplementary-file/add-supplementary-file.component';
import { AskBeforeDeleteComponent } from '../ask-before-delete/ask-before-delete.component';

@Component({
  selector: 'app-supplementary-files-dialog',
  templateUrl: './supplementary-files.component.html',
  styleUrls: ['./supplementary-files.component.scss']
})
export class SupplementaryFilesDialogComponent {

  supplementaryFilesMap?: YMap<any>
  supplementaryFilesNumbers?: string[]
  supplementaryFiles?: { [key: string]: supplementaryFile }
  editedSupplementaryFiles: { [key: string]: boolean } = {}
  newSupplementaryFilesNodes: { [key: string]: Node } = {}
  deletedSupplementaryFiles: string[] = []

  constructor(
    private ydocService: YdocService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<SupplementaryFilesDialogComponent>,
    private serviceShare: ServiceShare
  ) {
    let supplementaryFilesNumbersArray = this.ydocService.supplementaryFilesMap!.get('supplementaryFilesNumbers')
    let supplementaryFiles = this.ydocService.supplementaryFilesMap!.get('supplementaryFiles')
    this.supplementaryFilesNumbers = JSON.parse(JSON.stringify(supplementaryFilesNumbersArray))
    this.supplementaryFiles = JSON.parse(JSON.stringify(supplementaryFiles));
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.supplementaryFilesNumbers!, event.previousIndex, event.currentIndex);
  }

  editSupplementaryFile(supplementaryFile: supplementaryFile, supplementaryFileIndex: number) {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddSupplementaryFileComponent, {
      //width: '100%',
      // height: '90%',
      data: { supplementaryFile, updateOnSave: false, index: supplementaryFileIndex, supplementaryFileID: supplementaryFile.supplementary_file_ID },
      disableClose: false
    }).afterClosed().subscribe((result: { supplementaryFile: supplementaryFile, supplementaryFileNode: Node }) => {
      if (result && result.supplementaryFile && result.supplementaryFileNode) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true)
        this.supplementaryFilesNumbers?.splice(supplementaryFileIndex, 1, result.supplementaryFile.supplementary_file_ID)
        this.supplementaryFiles![result.supplementaryFile.supplementary_file_ID] = result.supplementaryFile
        this.newSupplementaryFilesNodes[result.supplementaryFile.supplementary_file_ID] = result.supplementaryFileNode
        this.editedSupplementaryFiles[result.supplementaryFile.supplementary_file_ID] = true
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.supplementaryFiles!, this.supplementaryFilesNumbers!,'supplementary_file_citation');
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false)
      }
    })
  }

  deleteSupplementaryFile(supplementaryFile: supplementaryFile, supplementaryFileIndex: number) {
    let dialogRef = this.dialog.open(AskBeforeDeleteComponent, {
      data: { type: 'supplementaryFile', dontshowType:true,objName:'Suppl. material №'+(supplementaryFileIndex+1)  },
      panelClass: 'ask-before-delete-dialog',
    })
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.supplementaryFilesNumbers?.splice(supplementaryFileIndex, 1);
        delete this.supplementaryFiles![supplementaryFile.supplementary_file_ID]
          if (this.editedSupplementaryFiles[supplementaryFile.supplementary_file_ID]) {
            delete this.editedSupplementaryFiles[supplementaryFile.supplementary_file_ID];
          }
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.supplementaryFiles!, this.supplementaryFilesNumbers!,'supplementary_file_citation');
      }
    })
  }

  addSupplementaryFile() {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddSupplementaryFileComponent, {
      //width: '100%',
      // height: '90%',
      data: { supplementaryFile: undefined, updateOnSave: false, index: this.supplementaryFilesNumbers?.length },
      disableClose: false
    }).afterClosed().subscribe((result: { supplementaryFile: supplementaryFile, supplementaryFileNode: Node }) => {
      if (result && result.supplementaryFile && result.supplementaryFileNode) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true);
        this.supplementaryFilesNumbers?.push(result.supplementaryFile.supplementary_file_ID)
        this.supplementaryFiles![result.supplementaryFile.supplementary_file_ID] = result.supplementaryFile
        this.newSupplementaryFilesNodes[result.supplementaryFile.supplementary_file_ID] = result.supplementaryFileNode
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.supplementaryFiles!, this.supplementaryFilesNumbers!,'supplementary_file_citation');
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false);
      }
    })
  }

  saveSupplementaryFiles() {
    this.dialogRef.close(true)
  }

  cancelSupplementaryFilesEdit() {
    this.dialogRef.close()
  }
}

