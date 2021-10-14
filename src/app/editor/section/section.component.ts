import { AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { EditSectionService } from '../dialogs/edit-section-dialog/edit-section.service';
import { TaxonomicCoverageComponent } from '../formioComponents/taxonomic-coverage/taxonomic-coverage.component';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { articleSection, editorData, sectionContentData, taxa, taxonomicCoverageContentData, titleContentData } from '../utils/interfaces/articleSection';

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements AfterViewInit ,AfterContentInit,OnInit{

  sectionContent: any
  renderForm = false

  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();

  constructor(private ydocService :YdocService,private editSectionService:EditSectionService,private prosemirrorEditorsService:ProsemirrorEditorsService) { }

  ngAfterContentInit(){
  }
  
  ngOnInit(){
    
  }

  
  
  onSubmit(submision?:any){
    this.editSectionService.editChangeSubject.next(submision);
  }
  
  ngAfterViewInit(): void {
    let components ;
    try{
      components = this.renderSection()
      if(this.section.mode=='editMode'){
        components.push(
          {
              "type": "button",
              "label": "Submit",
              "key": "submit",
              "disableOnInvalid": true,
              "input": true,
              "tableView": false
          })
      }
    }catch(e){
      console.log(e);
    }
    this.sectionContent = {
      'title': 'My Test Form',
      'components': components
    }
    this.renderForm = true
  }

  renderSection() {
    let t = this.section.title
    let c = this.section.sectionContent
    return [...this.renderFormioComponent(t.type, t.key, t.contentData!), ...this.renderFormioComponent(c.type, c.key, c.contentData!)]
  }

  renderFormioComponent(type: string, key: 'titleContent'|'sectionContent'|string, contentData: titleContentData | sectionContentData,attr?:any): any {
    let re :any
    if (type == 'editorContentType') {
      
      
        re = [{
          type: type,
          key: key,
          input: true,
          'defaultValue': { contentData, sectionData: this.section },
          ...attr
        }]
      
    } else if(type == 'taxonomicCoverageContentType'){
      re = this.renderTaxonomicComponent(type, key, contentData as taxonomicCoverageContentData)
    }else if(type == 'TaxonTreatmentsMaterial'){
      let cd = contentData as editorData
      if(cd.editorMeta?.formioJson && this.section.mode == 'editMode'){
        re = [
          this.renderContentFormioJson(type,key,contentData)
          //cd.editorMeta?.formioJson
        ]
      }else{
        re = [{
          type: "editorContentType",
          key: key,
          input: true,
          'defaultValue': { contentData, sectionData: this.section },
          ...attr
        }]
      }
    }else {
      re = [{
        type: type,
        key: key,
        input: true,
        'defaultValue': { contentData, sectionData: this.section },
        ...attr
      }]
    }
    return re
  }

  renderContentFormioJson(type:string,key:string,contentData:titleContentData | sectionContentData){
    if(type == 'TaxonTreatmentsMaterial'){
      //let nodeJsonFormIOStructureObj = this.ydocService.articleStructure?.get(this.section.sectionID+'TaxonTreatmentsMaterial')
      let formIOJson = this.ydocService.articleStructure?.get(this.section.sectionID+'TaxonTreatmentsMaterialFormIOJson')

      let editorDoc = this.prosemirrorEditorsService.editorContainers[(contentData as editorData).editorId].editorView.state.doc
      if(editorDoc.content.size>1000){
        return formIOJson
      }
      let inputContainerNodesArray = editorDoc.content.content[0].content.content // content of the first paragrapt in the editor 

      let inputsInEditor:any={

      }

      inputContainerNodesArray.forEach((node:any)=>{
        let inputId = node.attrs.inputId;

        let labelNode = node.content.content[0];
        let label = labelNode.attrs.text;

        let placeholderNode = node.content.content[1];
        let placeholder = placeholderNode.content.content[0].text;

        inputsInEditor[inputId] = {placeholder}
        /* nodeJsonFormIOStructureObj[inputId].key = inputId+label;
        nodeJsonFormIOStructureObj[inputId].defaultValue = placeholder; */
      })
      //this.ydocService.articleStructure?.set(this.section.sectionID+'TaxonTreatmentsMaterial',nodeJsonFormIOStructureObj)
      
      let recursiveInputDetect = (components:any[])=>{
        components.forEach((el,index,array)=>{
          if(el.input){
            let keyData = el.key.split('|');
            if(inputsInEditor[keyData[0]]){
              el.defaultValue = inputsInEditor[keyData[0]].placeholder
            }
          }
          if(el.components){
            if(el?.components.length > 0){
              recursiveInputDetect(el.components);
            }
          }
        })
      }
      recursiveInputDetect([formIOJson])
      this.ydocService.articleStructure?.set(this.section.sectionID+'TaxonTreatmentsMaterialFormIOJson',formIOJson)

      return formIOJson
    }
  }
  
  renderRow (taxa: taxa,index:number){
    let selectDefaultValue = taxa.rank.defaulValue?{'defaultValue':taxa.rank.defaulValue}:{}
    let rows = [
      {
        "components": [
          ...this.renderFormioComponent("editorContentType", "scientificName", taxa.scietificName,{"tableView":true}),

        ]
      }, {
        "components": [
          ...this.renderFormioComponent("editorContentType", "commonName", taxa.commonName),

        ]
      }, {
        "components": [
          {
            "label": "Rank",
            "widget": "choicesjs",
            "tableView": true,
            "data": {
              "values": taxa.rank.options.reduce<{"label": string,"value": string}[]>((prev, curr, i, arr) => {
                return prev.concat([{"label": arr[i],"value": arr[i]}])}, []),
            },
            "properties": {
              "tableRowIndex": index,
              "Section": this.section,
              "TaxonomicSection":this.section.sectionContent,
              "type":'sectionContent'
            },
            "selectThreshold": 0.3,
            "key": `rank${index}`,
            "type": "select",
            "indexeddb": {
              "filter": {}
            },
            "input": true,
            ...selectDefaultValue
          }
        ]
      }
    ]
    return rows
  }
  renderTaxonomicComponent(type: string, key: string, contentData: taxonomicCoverageContentData) {
    let rows:any[] = [];
    contentData.taxaArray.forEach((taxa,index)=>{
      rows.push(this.renderRow(taxa,index));
    })
    return [...this.renderFormioComponent('editorContentType', 'description', contentData.description), {
      "label": "Table",
      "cellAlignment": "left",
      "key": "table",
      "type": "table",
      "input": true,
      'defaultValue': { contentData, sectionData: this.section,type:'sectionContent' },
      "tableView": false,
      "rows": rows,
      "numRows": rows.length,
      "numCols": 3
    }]
  }

  submit(value: any) {
  }
}
