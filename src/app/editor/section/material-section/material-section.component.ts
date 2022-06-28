import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TreeService} from '@app/editor/meta-data-tree/tree-service/tree.service';
import {articleSection} from '@app/editor/utils/interfaces/articleSection';
import {HttpClient} from "@angular/common/http";
import {HelperService} from "@app/editor/section/helpers/helper.service";
import {Observable} from "rxjs";
import {startWith, map} from "rxjs/operators";

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
  selected = new FormControl(0);
  //@ts-ignore
  materialStructure: any = {categories: {} as any};
  tabs;
  render = false;
  typeStatus!: FormControl;
  typeHeading!: FormControl;
  listChar!: FormControl;
  searchdarwincore: FormControl = new FormControl();
  filteredOptions: Observable<string[]>;
  props;

  constructor(
    private treeService: TreeService,
    public http: HttpClient,
    public helperService: HelperService
  ) {
    // console.log(materialStructure.categories);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.props.filter(option => option.toLowerCase().includes(filterValue));
  }

  ngAfterViewInit(): void {
    const root = this.helperService.filter(this.treeService.articleSectionsStructure, this.section.sectionID);
    this.materialStructure = root.override;
    this.tabs = Object.keys(root.override.categories);
    this.props = Object.keys(root.override.categories).map(key => {
      return root.override.categories[key].entries.map(entry => {
        return entry.localName
      })
    }).flat();

    this.typeStatus = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('typeStatus')?.value);
    this.typeHeading = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('typeHeading')?.value);
    this.listChar = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('listChar')?.value);
    this.render = true;

    this.props.forEach(control => {
      this[control] = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get(control)?.value);
    });

    this.filteredOptions = this.searchdarwincore.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );
  }

  optionSelected(event, tabs) {
    const index = tabs.findIndex(tab => {
      return tab.value.entries.some(el => el.localName.toLowerCase() === event.option.value.toLowerCase());
    });
    this.selected.setValue(index);
    setTimeout(() => {
      document.getElementById(event.option.value.toLowerCase()).focus();
    }, 300)
    console.log(event.option.value, tabs);
  }

  async triggerSubmit() {
    let data: any = {
      typeStatus: this.typeStatus!.value,
      typeHeading: this.typeHeading!.value,
      listChar: this.listChar!.value
    }
    this.props.forEach(prop => {
      data[prop] = this[prop] && this[prop]!.value
    });
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === null) {
        if (key !== 'listChar' && key !== 'typeHeading') {
          delete data[key];
        }
      }
    })
    await this.onSubmit({data});
  }
}
