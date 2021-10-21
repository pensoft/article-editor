import { AfterContentInit, AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { EditSectionService } from '../dialogs/edit-section-dialog/edit-section.service';
import { TaxonomicCoverageComponent } from '../formioComponents/taxonomic-coverage/taxonomic-coverage.component';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { articleSection, editorData, sectionContentData, taxa, taxonomicCoverageContentData, titleContentData } from '../utils/interfaces/articleSection';

let staticProsemirrorNodeHTMLyarn  = `<div contenteditable="true" translate="no" class="ProseMirror ProseMirror-example-setup-style">
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="" data-validations="max-size:100" data-regex="^[a-zA-Z ]{0,15}$">Idddddddddddddd</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="" data-validations="" data-regex="">qweqqe</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="" data-validations="" data-regex="">wewqee</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="" data-validations="" data-regex="">lab</p>
</div>`
let smallHTML = `<div contenteditable="true" translate="no" class="ProseMirror ProseMirror-example-setup-style">
<p class="set-align-left" data-validations="max-size:100" data-regex="^[a-zA-Z ]{0,15}$" data-id="" data-track="[]" data-group="" data-viewid="">I </p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweqqwe; idqweeqweqwe </p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">wewqeqwe</p>
<input_container1 data-input-id="">
    <input_label style="color:gray" contenteditable="false">label</input_label>
    <input_placeholder style="border:1px solid black;margin-left:3px;margin-right:3px">placeholder</input_placeholder>
</input_container1>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qw</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">eeewEEweqweEQ<span class="comment" data-id="4191f684-092c-486a-ad11-63f97b3e690f" data-conversation="[]" data-viewid="" data-group="">WEEEw</span>; idqweeqweqwe</p>
<div class="tableWrapper">
    <table style="min-width: 75px;">
        <colgroup>
            <col>
            <col>
            <col>
        </colgroup>
        <tbody>
            <tr>
                <td>
                    <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">ee<sup>ee</sup><sub><sup>wewe</sup>eewe</sub>wewe</p>
                </td>
                <td>
                    <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">ew</p>
                </td>
                <td>
                    <p class="set-align-right" data-id="" data-track="[]" data-group="" data-viewid="">qwe</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid=""><br></p>
                    <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweeqweqwe</p>
                </td>
                <td>
                    <p class="set-align-center" data-id="" data-track="[]" data-group="" data-viewid="">
                        <math-inline class="math-node" title="" contenteditable="false"><span class="math-render"><span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi>d</mi><mi>q</mi><mi>w</mi><mi>d</mi></mrow><annotation encoding="application/x-tex">dqwd</annotation></semantics></math></span>
                            <span
                                class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height: 0.88888em; vertical-align: -0.19444em;"></span><span class="mord mathnormal">d</span><span class="mord mathnormal" style="margin-right: 0.02691em;">qw</span><span class="mord mathnormal">d</span></span>
                                </span>
                                </span>
                                </span><span class="math-src"></span></math-inline>dqwdqwd</p>
                </td>
                <td>
                    <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qwe</p>
                </td>
            </tr>
            <tr>
                <td>
                    <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">placeholder</p>
                </td>
                <td>
                    <ol>
                        <li>
                            <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">werwerwer</p>
                        </li>
                        <li>
                            <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">wer</p>
                        </li>
                        <li>
                            <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">werwerwer</p>
                        </li>
                    </ol>
                </td>
                <td>
                    <ul>
                        <li>
                            <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweqweqwe</p>
                        </li>
                        <li>
                            <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qwe</p>
                        </li>
                        <li>
                            <p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweqwe</p>
                        </li>
                    </ul>
                </td>
            </tr>
        </tbody>
    </table>
</div>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid=""><span class="comment" data-id="4191f684-092c-486a-ad11-63f97b3e690f" data-conversation="[]" data-viewid="" data-group="">wwe</span>qEEqwe</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweq</p>
<input_container1 data-input-id="">
    <input_label style="color:gray" contenteditable="false">label</input_label>
    <input_placeholder style="border:1px solid black;margin-left:3px;margin-right:3px">placeholder</input_placeholder>
</input_container1>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">; idq</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">wewqeqwe</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">labelplaceholdereewEEweqweEQWEEEwwweqEE</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweq</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">wewqeqwe</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">labelplaceholder</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qw</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">e</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qw</p>
<p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">e</p>
</div>`
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
