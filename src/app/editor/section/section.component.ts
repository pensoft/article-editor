import { AfterContentInit, AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaxonomicCoverageComponent } from '../formioComponents/taxonomic-coverage/taxonomic-coverage.component';
import { articleSection, sectionContentData, taxa, taxonomicCoverageContentData, titleContentData } from '../utils/interfaces/articleSection';

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

  constructor() { }

  ngAfterContentInit(){
  }
  
  ngOnInit(){
    
  }
  
  ngAfterViewInit(): void {
    this.sectionContent = {
      'title': 'My Test Form',
      'components': this.renderSection()
    }
    this.renderForm = true
  }

  renderSection() {
    let t = this.section.title
    let c = this.section.sectionContent
    return [...this.renderFormioComponent(t.type, t.key, t.contentData!), ...this.renderFormioComponent(c.type, c.key, c.contentData!)]
  }

  renderFormioComponent(type: string, key: string, contentData: titleContentData | sectionContentData,attr?:any): any {
    if (type !== 'taxonomicCoverageContentType') {
      return [{
        type: type,
        key: key,
        input: true,
        'defaultValue': { contentData, sectionData: this.section },
        ...attr
      }]
    } else {
      return this.renderTaxonomicComponent(type, key, contentData as taxonomicCoverageContentData)
    }
  }
  renderRow (taxa: taxa){
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
            "selectThreshold": 0.3,
            "key": "rank",
            "type": "select",
            "indexeddb": {
              "filter": {}
            },
            "input": true
          }
        ]
      }
    ]
    return rows
  }
  renderTaxonomicComponent(type: string, key: string, contentData: taxonomicCoverageContentData) {
    let rows:any[] = [];
    contentData.taxaArray.forEach((taxa)=>{
      rows.push(this.renderRow(taxa));
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
    console.log('submitedData', value);
  }
}
