import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { Node } from 'prosemirror-model';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { AddEndNoteComponent } from './add-end-note/add-end-note.component';
import { endNote } from '@app/editor/utils/interfaces/endNotes';
import { AskBeforeDeleteComponent } from '../ask-before-delete/ask-before-delete.component';
@Component({
  selector: 'end-notes-dialog',
  templateUrl: './end-notes.component.html',
  styleUrls: ['./end-notes.component.scss']
})
export class EndNotesDialogComponent {

  endNotesMap?: YMap<any>
  endNotesNumbers?: string[]
  endNotes?: { [key: string]: endNote }
  editedEndNotes: { [key: string]: boolean } = {}
  newEndNotesNodes: { [key: string]: Node } = {}
  deletedEndNotes: string[] = []

  constructor(
    private ydocService: YdocService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<EndNotesDialogComponent>,
    private serviceShare: ServiceShare
  ) {
    let endNotesNumbersArray = this.ydocService.endNotesMap!.get('endNotesNumbers')
    let endNotes = this.ydocService.endNotesMap!.get('endNotes')
    this.endNotesNumbers = JSON.parse(JSON.stringify(endNotesNumbersArray))
    this.endNotes = JSON.parse(JSON.stringify(endNotes));
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.endNotesNumbers!, event.previousIndex, event.currentIndex);
  }

  editEndNote(endNote: endNote, endNoteIndex: number) {
    this.dialog.open(AddEndNoteComponent, {
      //width: '100%',
      // height: '90%',
      data: { endNote, updateOnSave: false, index: endNoteIndex, endNoteID: endNote.end_note_ID },
      disableClose: false
    }).afterClosed().subscribe((result: { endNote: endNote, endNoteNode: Node }) => {
      if (result && result.endNote && result.endNoteNode) {
        this.endNotesNumbers?.splice(endNoteIndex, 1, result.endNote.end_note_ID)
        this.endNotes![result.endNote.end_note_ID] = result.endNote
        this.newEndNotesNodes[result.endNote.end_note_ID] = result.endNoteNode
        this.editedEndNotes[result.endNote.end_note_ID] = true
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.endNotes!, this.endNotesNumbers!,'end_note_citation');
      } else {
      }
    })
  }

  deleteEndNote(endNote: endNote, endNoteIndex: number) {
    let dialogRef = this.dialog.open(AskBeforeDeleteComponent, {
      data: { type: 'endNote', dontshowType:true,objName:'*'+(endNoteIndex+1)  },
      panelClass: 'ask-before-delete-dialog',
    })
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.endNotesNumbers?.splice(endNoteIndex, 1);
        delete this.endNotes![endNote.end_note_ID]
          if (this.editedEndNotes[endNote.end_note_ID]) {
            delete this.editedEndNotes[endNote.end_note_ID];
          }
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.endNotes!, this.endNotesNumbers!,'end_note_citation');
      }
    })
  }

  addEndNote() {
    this.dialog.open(AddEndNoteComponent, {
      //width: '100%',
      // height: '90%',
      data: { endNote: undefined, updateOnSave: false, index: this.endNotesNumbers?.length },
      disableClose: false
    }).afterClosed().subscribe((result: { endNote: endNote, endNoteNode: Node }) => {
      if (result && result.endNote && result.endNoteNode) {
        this.endNotesNumbers?.push(result.endNote.end_note_ID)
        this.endNotes![result.endNote.end_note_ID] = result.endNote
        this.newEndNotesNodes[result.endNote.end_note_ID] = result.endNoteNode
        this.serviceShare.CitableElementsService.writeElementDataGlobal(this.endNotes!, this.endNotesNumbers!,'end_note_citation');
      } else {
      }
    })
  }

  saveEndNotes() {
    this.dialogRef.close(true)
  }

  cancelEndNotesEdit() {
    this.dialogRef.close()
  }
}

