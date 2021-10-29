import { AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
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
import { schema ,inputConstructor,inputConstructor1} from '../../utils/schema';
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

  data1: articleSection;
  sectionForm: FormGroup;
  sectionContent: any;

  EditSubmitsubscription?:Subscription;
  constructor(
    private dialogRef: MatDialogRef<EditSectionDialogComponent>,
    public prosemirrorService: ProsemirrorEditorsService,
    public ydocService: YdocService, 
    public ydocCopyService: YdocCopyService,
    public AppRef : ApplicationRef,
    public changeDector : ChangeDetectorRef,
    public editSectionService: EditSectionService,
    @Inject(MAT_DIALOG_DATA) public sectionData: any) {
      this.data1 = sectionData.node;
      this.sectionForm = sectionData.form;
      this.sectionContent = sectionData.sectionContent;
  }

  cancelEdit() {
   // this.dialogRef.close(this.data!);
    
  }
  
  saveSection(){
    console.log('SAVE');
    try{  
      this.ydocCopyService.saveEditedSection(this.data1,this.data!);  
      //this.dialogRef.close(this.data!);  
    }catch(e){  
      console.log(e);  
    }  
  }

  generateProsemirrorJsonDocument(array:{key:string;value:string}[],editorId:string){
    let xmlFragment = this.prosemirrorService.getXmlFragment('documentMode',editorId);
    xmlFragment.delete(0,xmlFragment.length);
    let nodeContent:any[] = [] 
    let nodeContent1:any[] = [] 
    array.forEach((el)=>{
      let keyData = el.key.split('|');
      let node = inputConstructor(keyData[0],keyData[1],el.value+'').toJSON()
      let node1 = inputConstructor1(keyData[0],keyData[1],el.value+'').toJSON()
      nodeContent.push(node)
      nodeContent1.push(node1)
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
    let node1 = {
      "type": "doc",
      "content": nodeContent1
    }
    console.log(node1);
    try{
      let nodes = prosemirrorNode.fromJSON(schema, node) as any
      let nodes1 = prosemirrorNode.fromJSON(schema, node1) as any
      updateYFragment(xmlFragment.doc, xmlFragment, nodes1, new Map())
      return nodes 
    }catch(e){
      console.log(e);
    }
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
          console.log(formIOJson);
          recursiveInputDetect([formIOJson])
          this.generateProsemirrorJsonDocument(sectionInputArray,(this.data!.sectionContent.contentData as editorData).editorId)
          this.dialogRef.close({data:this.data!,submitType:'TaxonTreatmentsMaterial'})
        }else{
          this.saveSection()
          this.dialogRef.close({data:this.data!,submitType:'sectionUpdate'})
        }
      })
      //this.data = data
    } catch (e) {
      console.log(e);
    }
  }

  copySection(data: articleSection) {
    data.mode = 'editMode'
    return
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
