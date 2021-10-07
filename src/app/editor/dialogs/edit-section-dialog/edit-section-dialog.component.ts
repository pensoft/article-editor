import { AfterViewInit, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { YdocService } from '../../services/ydoc.service';
import { articleSection } from '../../utils/interfaces/articleSection';
import { editorData, titleContent, sectionContent, taxonomicCoverageContentData } from '../../utils/interfaces/articleSection';
import { EditSectionService } from './edit-section.service';
import { YdocCopyService } from '../../services/ydoc-copy.service'
@Component({
  selector: 'app-edit-section-dialog',
  templateUrl: './edit-section-dialog.component.html',
  styleUrls: ['./edit-section-dialog.component.scss']
})
export class EditSectionDialogComponent implements AfterViewInit {


  //@Input() section!: articleSection;
  //@Output() sectionChange = new EventEmitter<articleSection>();
  data?: articleSection
  constructor(
    private dialogRef: MatDialogRef<EditSectionDialogComponent>,
    public ydocService: YdocService, public ydocCopyService: YdocCopyService,
    public editSectionService: EditSectionService,
    @Inject(MAT_DIALOG_DATA) public data1: articleSection) {

  }

  cancelEdit() {
    this.dialogRef.close();
  }

  saveSection(){
    try{
      this.ydocCopyService.saveEditedSection(this.data1,this.data!)
      this.dialogRef.close();
    }catch(e){
      console.log(e);
    }
  }

  ngAfterViewInit(): void {
    try {
      let data: articleSection = JSON.parse(JSON.stringify(this.data1));
      this.copySection(data);
      this.editSectionService.editChangeSubject.subscribe((data) => {
        let sectionData = data.sectionData! as any
        sectionData[data.type].contentData = data.contentData
        console.log(sectionData);
        this.data = undefined
        setTimeout(() => {
          this.data = sectionData
        }, 0)
      })
      this.data = data
    } catch (e) {
      console.log(e);
    }
  }

  copySection(data: articleSection) {
    data.mode = 'editMode'
    let changeEditorId = (editorData: editorData) => {
      let oldEditorId = editorData.editorId
      let newEditorId = this.ydocCopyService.copyXmlFragmentWithId(oldEditorId);
      editorData.editorId = newEditorId
    }
    let copyContent = (content: titleContent | sectionContent) => {
      if (content.type == 'editorContentType') {
        changeEditorId(content.contentData as editorData)
      } else if (content.type == 'taxonomicCoverageContentType') {
        let taxonomicContentData = content.contentData as taxonomicCoverageContentData
        changeEditorId(taxonomicContentData.description)
        taxonomicContentData.taxaArray.forEach((el, i, arr) => {
          changeEditorId(arr[i].commonName)
          changeEditorId(arr[i].scietificName)
        })
      }
    }
    copyContent(data.title)
    copyContent(data.sectionContent)
  }

  onNoClick(): void {
    this.dialogRef.close();

  }
}
