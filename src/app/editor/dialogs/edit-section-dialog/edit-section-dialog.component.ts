import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { YdocService } from '../../services/ydoc.service';
import { articleSection } from '../../utils/interfaces/articleSection';
import { editorData, titleContent, sectionContent, taxonomicCoverageContentData } from '../../utils/interfaces/articleSection';
import { EditSectionService } from './edit-section.service';
import { YdocCopyService } from '../../services/ydoc-copy.service'
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { Node as prosemirrorNode } from 'prosemirror-model';
//@ts-ignore
import { updateYFragment } from '../../../y-prosemirror-src/plugins/sync-plugin.js';
import { schema ,inputConstructor} from '../../utils/schema';
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
    public prosemirrorService: ProsemirrorEditorsService,
    public ydocService: YdocService, 
    public ydocCopyService: YdocCopyService,
    public AppRef : ApplicationRef,
    public changeDector : ChangeDetectorRef,
    public editSectionService: EditSectionService,
    @Inject(MAT_DIALOG_DATA) public data1: articleSection) {

  }

  cancelEdit() {
   // this.dialogRef.close(this.data!);
    
  }
  
  saveSection(){
    try{  
      this.ydocCopyService.saveEditedSection(this.data1,this.data!,);  
      //this.dialogRef.close(this.data!);  
    }catch(e){  
      console.log(e);  
    }  
  }

  generateProsemirrorJsonDocument(array:{key:string;value:string}[],editorId:string){
    let xmlFragment = this.prosemirrorService.getXmlFragment('documentMode',editorId);
    xmlFragment.delete(0,xmlFragment.length);
    let nodeContent:any[] = [] 
    array.forEach((el)=>{
      let keyData = el.key.split('|');
      let node = inputConstructor(keyData[0],keyData[1],el.value+'').toJSON()
      
      nodeContent.push(node)
    })
    let node = {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "attrs": {
            "align": "set-align-left",
            "id": "",
            "track": [],
            "group": "",
            "viewid": ""
          },
          "content":nodeContent
        }
      ]
    }
    try{
      let nodes = prosemirrorNode.fromJSON(schema, node) as any
      updateYFragment(xmlFragment.doc, xmlFragment, nodes, new Map())
      return nodes 
    }catch(e){
      console.log(e);
    }
  }

  ngAfterViewInit(): void {
    try {
      let data: articleSection = JSON.parse(JSON.stringify(this.data1));
      this.copySection(data);
      this.editSectionService.editChangeSubject.subscribe((submit:any) => {
        console.log(submit); 
        
        if(this.data!.sectionContent.type == 'TaxonTreatmentsMaterial'){
          let editorContentData = this.data!.sectionContent.contentData as editorData
          let sectionInputArray:any[] = []
          let recursiveInputDetect = (components:any[])=>{
            components.forEach((el)=>{
              if(el.input){
                if(submit.data[el.key]!==''&&submit.data[el.key]!== undefined&&submit.data[el.key]!== null){
                  let key = `${el.key}`
                  let value = submit.data[el.key]
                  sectionInputArray.push({key,value});
                }
              }
              if(el.components){
                if(el?.components.length > 0){
                  recursiveInputDetect(el.components);
                }
              }
            })
          }
          let formIOJson = this.ydocService.articleStructure?.get(this.data!.sectionID+'TaxonTreatmentsMaterialFormIOJson')
          recursiveInputDetect([formIOJson])
          this.generateProsemirrorJsonDocument(sectionInputArray,(this.data!.sectionContent.contentData as editorData).editorId)
          this.dialogRef.close({data:this.data!,submitType:'TaxonTreatmentsMaterial'})
        }else{
          this.saveSection()
          this.dialogRef.close({data:this.data!,submitType:'sectionUpdate'})
        }
      })
      this.data = data
    } catch (e) {
      console.log(e);
    }
  }

  copySection(data: articleSection) {
    data.mode = 'editMode'
    let changeEditorId = (editorData: editorData,editorMeta?:any) => {
      let oldEditorId = editorData.editorId
      editorMeta?editorData.editorMeta = editorMeta:editorMeta
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
          changeEditorId(arr[i].commonName,{placeHolder:'CommonName...',label:'Common name'})
          changeEditorId(arr[i].scietificName,{placeHolder:'ScietificName...',label:'Scietific name'})
        })
      }
    }
    copyContent(data.title)
    copyContent(data.sectionContent)
  }

  onNoClick(): void {
    console.log('CLOSED');
    //this.dialogRef.close(this.data!);
  }
}
