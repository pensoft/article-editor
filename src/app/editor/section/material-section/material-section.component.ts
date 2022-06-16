import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TreeService} from '@app/editor/meta-data-tree/tree-service/tree.service';
import {articleSection} from '@app/editor/utils/interfaces/articleSection';
import {HttpClient} from "@angular/common/http";
import {map, startWith, tap} from "rxjs/operators";
import {Observable} from "rxjs";
import {journalTree} from "@core/services/journalTreeConstants";
import CSVToArray  from 'csv-to-array-browser';
import {materialStructure} from "@core/services/custom_sections/materials_structure";

@Component({
  selector: 'app-material-section',
  templateUrl: './material-section.component.html',
  styleUrls: ['./material-section.component.scss']
})
export class MaterialSectionComponent implements AfterViewInit {

  @Input() onSubmit!: (data: any) => Promise<any>;
  @Output() onSubmitChange = new EventEmitter<(data: any) => Promise<any>>();

  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();
  materialStructure = materialStructure;
  render = false;
  typeStatus!: FormControl;
  typeHeading!: FormControl;
  listChar!: FormControl;
  searchdarwincore!: FormControl;

  props = Object.keys(materialStructure.categories).map(key => {
    return materialStructure.categories[key].entries.map(entry => {
      return entry.localName
    })
  }).flat()

  constructor(
    private treeService: TreeService,
    public http: HttpClient
  ) {
    console.log(materialStructure.categories);
  }

  ngAfterViewInit(): void {
    this.props.forEach(control => {
      this[control] = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get(control)?.value);
    });

    this.typeStatus = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('typeStatus')?.value);
    this.typeHeading = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('typeHeading')?.value);
    this.listChar = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('listChar')?.value);
    this.searchdarwincore = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('searchdarwincore')?.value);
    this.render = true;
  }

  async triggerSubmit() {
    let data: any = {
      typeStatus: this.typeStatus!.value,
      typeHeading: this.typeHeading!.value,
      listChar: this.listChar!.value,
      searchdarwincore: this.searchdarwincore!.value
    }
    this.props.forEach(prop => {
      data[prop] = this[prop]!.value
    });
    Object.keys(data).forEach(key => {
      if(data[key] === undefined || data[key] === null) {
        if(key !== 'listChar' && key !== 'typeHeading') {
          delete data[key];
        }
      }
    })
    await this.onSubmit({data});
  }

}
