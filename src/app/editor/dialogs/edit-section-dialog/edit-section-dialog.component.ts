import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { YdocService } from '../../services/ydoc.service';
import { articleSection } from '../../utils/interfaces/articleSection';
import { EditSectionService } from './edit-section.service';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { Node as prosemirrorNode } from 'prosemirror-model';
//@ts-ignore
import { updateYFragment } from '../../../y-prosemirror-src/plugins/sync-plugin.js';
import { schema } from '../../utils/Schema';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
@Component({
  selector: 'app-edit-section-dialog',
  templateUrl: './edit-section-dialog.component.html',
  styleUrls: ['./edit-section-dialog.component.scss']
})
export class EditSectionDialogComponent implements AfterViewInit,OnDestroy {


  //@Input() section!: articleSection;
  //@Output() sectionChange = new EventEmitter<articleSection>();

  data?: articleSection
  showSection = false;

  data1: articleSection;
  sectionForm: FormGroup;
  formIOJson: any;
  prityJson:string;
  component: any;

  EditSubmitsubscription?:Subscription;
  constructor(
    private dialogRef: MatDialogRef<EditSectionDialogComponent>,
    public prosemirrorService: ProsemirrorEditorsService,
    public ydocService: YdocService,
    public AppRef : ApplicationRef,
    public changeDector : ChangeDetectorRef,
    public editSectionService: EditSectionService,
    @Inject(MAT_DIALOG_DATA) public sectionData: any) {
      this.component = sectionData.component;
      this.data1 = sectionData.node;
      this.sectionForm = sectionData.form;
      this.formIOJson = sectionData.formIOJson;
      this.prityJson = JSON.stringify(sectionData.formIOJson,null,"\t")

  }

  cancelEdit() {
   // this.dialogRef.close(this.data!);

  }


  ngOnDestroy(){
    this.EditSubmitsubscription?.unsubscribe();
  }

  ngAfterViewInit(): void {
    try {
      this.data = JSON.parse(JSON.stringify(this.data1));
      this.copySection(this.data!);
      this.EditSubmitsubscription = this.editSectionService.editChangeSubject.subscribe((submit:any) => {
        this.dialogRef.close({...submit,section:this.data})
        return
      })
      //this.data = data
    } catch (e) {
      console.error(e);
    }
  }

  copySection(data: articleSection) {
    data.mode = 'editMode'
  }

  onNoClick(): void {
  }
}
