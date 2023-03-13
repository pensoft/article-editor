import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TreeService} from '@app/editor/meta-data-tree/tree-service/tree.service';
import {articleSection} from '@app/editor/utils/interfaces/articleSection';
import {HttpClient} from "@angular/common/http";
import {HelperService} from "@app/editor/section/helpers/helper.service";
import {Observable, Subject} from "rxjs";
import {startWith, map} from "rxjs/operators";
import { ServiceShare } from '@app/editor/services/service-share.service';
import { closeSingleQuote } from 'prosemirror-inputrules';
import { customSecInterface } from '../funder-section/funder-section.component';

@Component({
  selector: 'app-material-section',
  templateUrl: './material-section.component.html',
  styleUrls: ['./material-section.component.scss']
})
export class MaterialSectionComponent implements AfterViewInit,customSecInterface {

  @Input() onSubmit!: (data: any) => Promise<any>;
  @Output() onSubmitChange = new EventEmitter<(data: any) => Promise<any>>();

  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();

  @Input() triggerCustomSecSubmit: Subject<any>;
  @Output() triggerCustomSecSubmitChange = new EventEmitter<Subject<any>>();


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
    public helperService: HelperService,
    public serviceShare:ServiceShare
  ) {
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
    let customPropsObj = this.serviceShare.YdocService.customSectionProps.get('customPropsObj')
    let sectionCustomData = customPropsObj[this.section.sectionID]
    if(sectionCustomData){
      sectionCustomData.typeHeading?this.typeHeading.setValue(sectionCustomData.typeHeading):null
      sectionCustomData.typeStatus?this.typeStatus.setValue(sectionCustomData.typeStatus):null
      sectionCustomData.listChar?this.listChar.setValue(sectionCustomData.listChar):null
    }
    this.props.forEach(control => {
      this[control] = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get(control)?.value);
      if(sectionCustomData){
        this[control] = new FormControl(sectionCustomData[control]);
      }
    });

    this.filteredOptions = this.searchdarwincore.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || '')),
    );

    this.triggerCustomSecSubmit.subscribe(()=>{
      this.triggerSubmit()
    })
  }

  optionSelected(event, tabs) {
    const index = tabs.findIndex(tab => {
      return tab.value.entries.some(el => el.localName.toLowerCase() === event.option.value.toLowerCase());
    });
    this.selected.setValue(index);
    setTimeout(() => {
      document.getElementById(event.option.value.toLowerCase()).focus();
    }, 300)
  }

  @Output() async triggerSubmit() {
    let data: any = {
      typeStatus: this.typeStatus!.value,
      typeHeading: this.typeHeading!.value,
      listChar: this.listChar!.value
    }
    /* if(data.typeStatus!=data.typeHeading){
      data.typeHeading = data.typeStatus
    } */
    this.props.forEach(prop => {
      data[prop] = this[prop] && this[prop]!.value
    });
    Object.keys(data).forEach(key => {
      if (data[key] === undefined || data[key] === null) {
        if (key !== 'listChar' && key !== 'typeHeading' && key !== 'typeStatus') {
          delete data[key];
        }
      }
    })
    await this.onSubmit({data});
  }
}
