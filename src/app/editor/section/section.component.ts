import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EditSectionService } from '../dialogs/edit-section-dialog/edit-section.service';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { articleSection, editorData, sectionContentData, taxa, taxonomicCoverageContentData, titleContentData } from '../utils/interfaces/articleSection';

let smallHTML = `<ul>
<li><span>${data.textField1}</span>Morbi in sem quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra a, ultricies in, diam. Sed arcu. Cras consequat.</li>
<li><span>${data.textField2}</span>Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.</li>
<li><span>${data.textField3}</span>Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi.</li>
<li><span>${data.textField4}</span>Pellentesque fermentum dolor. Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc.</li>
</ul>`

@Component({
  selector: 'app-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss']
})
export class SectionComponent implements AfterViewInit, AfterContentInit, OnInit {

  sectionContent: any
  renderForm = false

  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();
  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;

  constructor(private ydocService: YdocService, private editSectionService: EditSectionService, private prosemirrorEditorsService: ProsemirrorEditorsService) { }

  ngAfterContentInit() {
  }

  ngOnInit() {

  }



  onSubmit(submision?: any) {
    this.editSectionService.editChangeSubject.next(submision);
  }

  ngAfterViewInit(): void {
    let components = [];
    console.log(this.section);
    if(this.section.mode == 'documentMode'&&this.section.active){
      try{
        this.prosemirrorEditorsService.renderEditorInWithId(this.editor?.nativeElement,this.section.sectionID,this.section)
      }catch(e){
        console.log(e);
      }
      return
    }
    try {
      //components = this.renderSection()
      let inputNumber = 100 , i = 0;
      while(i<inputNumber){
        i++;
        components.push({
          "label": `textField${i}`,
          "tableView": true,
          "key": `textField${i}`,
          "type": "textfield",
          "input": true
      })
      }
      if (this.section.mode == 'editMode') {
        components.push(
          {
            "type": "button",
            "label": "Submit",
            "key": "submit",
            "disableOnInvalid": true,
            "input": true,
            "tableView": false
          })
        components.unshift(
          {
            "label": "Prosemirror nodes html representation :",
            "autoExpand": false,
            "tableView": true,
            "key": "textAreaHTMLEditor",
            "type": "codemirror-html-editor",
            "defaultValue": smallHTML,
            "input": true
          }
        )
      }
    } catch (e) {
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

  renderFormioComponent(type: string, key: 'titleContent' | 'sectionContent' | string, contentData: titleContentData | sectionContentData, attr?: any): any {
    let re: any
    if (type == 'editorContentType') {


      re = [{
        type: type,
        key: key,
        input: true,
        'defaultValue': { contentData, sectionData: this.section },
        ...attr
      }]

    } else if (type == 'taxonomicCoverageContentType') {
      re = this.renderTaxonomicComponent(type, key, contentData as taxonomicCoverageContentData)
    } else if (type == 'TaxonTreatmentsMaterial') {
      let cd = contentData as editorData
      if (cd.editorMeta?.formioJson && this.section.mode == 'editMode') {
        re = [
          this.renderContentFormioJson(type, key, contentData)
          //cd.editorMeta?.formioJson
        ]
      } else {
        re = [{
          type: "editorContentType",
          key: key,
          input: true,
          'defaultValue': { contentData, sectionData: this.section },
          ...attr
        }]
      }
    } else {
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

  renderContentFormioJson(type: string, key: string, contentData: titleContentData | sectionContentData) {
    if (type == 'TaxonTreatmentsMaterial') {
      //let nodeJsonFormIOStructureObj = this.ydocService.articleStructure?.get(this.section.sectionID+'TaxonTreatmentsMaterial')
      let formIOJson = this.ydocService.articleStructure?.get(this.section.sectionID + 'TaxonTreatmentsMaterialFormIOJson')
      console.log(formIOJson);
      let editorContainer = this.prosemirrorEditorsService.editorContainers[(contentData as editorData).editorId]
      if (!editorContainer) {
        return formIOJson
      }
      let editorDoc = editorContainer.editorView.state.doc
      if (editorDoc.content.size > 1000) {
        return formIOJson
      }
      let inputContainerNodesArray = editorDoc.content.content // content of the first paragrapt in the editor

      let inputsInEditor: any = {

      }

      inputContainerNodesArray.forEach((node: any) => {
        let inputId = node.attrs.inputId;

        let labelNode = node.content.content[0];
        let label = labelNode.attrs.text;

        let placeholderNode = node.content.content[1];
        let placeholder = placeholderNode.content.content[0].text;

        inputsInEditor[inputId] = { placeholder }
        /* nodeJsonFormIOStructureObj[inputId].key = inputId+label;
        nodeJsonFormIOStructureObj[inputId].defaultValue = placeholder; */
      })
      //this.ydocService.articleStructure?.set(this.section.sectionID+'TaxonTreatmentsMaterial',nodeJsonFormIOStructureObj)

      let recursiveInputDetect = (components: any[]) => {
        components.forEach((el, index, array) => {
          if (el.input) {
            let keyData = el.key.split('|');
            if (inputsInEditor[keyData[0]]) {
              el.defaultValue = inputsInEditor[keyData[0]].placeholder
            }
          }
          if (el.components) {
            if (el?.components.length > 0) {
              recursiveInputDetect(el.components);
            }
          }
        })
      }
      recursiveInputDetect([formIOJson])
      this.ydocService.articleStructure?.set(this.section.sectionID + 'TaxonTreatmentsMaterialFormIOJson', formIOJson)

      return formIOJson
    }
  }

  renderRow(taxa: taxa, index: number) {
    let selectDefaultValue = taxa.rank.defaulValue ? { 'defaultValue': taxa.rank.defaulValue } : {}
    let rows = [
      {
        "components": [
          ...this.renderFormioComponent("editorContentType", "scientificName", taxa.scietificName, { "tableView": true }),

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
              "values": taxa.rank.options.reduce<{ "label": string, "value": string }[]>((prev, curr, i, arr) => {
                return prev.concat([{ "label": arr[i], "value": arr[i] }])
              }, []),
            },
            "properties": {
              "tableRowIndex": index,
              "Section": this.section,
              "TaxonomicSection": this.section.sectionContent,
              "type": 'sectionContent'
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
    let rows: any[] = [];
    contentData.taxaArray.forEach((taxa, index) => {
      rows.push(this.renderRow(taxa, index));
    })
    return [...this.renderFormioComponent('editorContentType', 'description', contentData.description), {
      "label": "Table",
      "cellAlignment": "left",
      "key": "table",
      "type": "table",
      "input": true,
      'defaultValue': { contentData, sectionData: this.section, type: 'sectionContent' },
      "tableView": false,
      "rows": rows,
      "numRows": rows.length,
      "numCols": 3
    }]
  }

  submit(value: any) {
  }
}
