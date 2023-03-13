import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {TreeService} from '@app/editor/meta-data-tree/tree-service/tree.service';
import {articleSection} from '@app/editor/utils/interfaces/articleSection';
import {HttpClient} from "@angular/common/http";
import {ServiceShare} from '@app/editor/services/service-share.service';
import { customSecInterface } from '../funder-section/funder-section.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-taxon-section',
  templateUrl: './taxon-section.component.html',
  styleUrls: ['./taxon-section.component.scss']
})
export class TaxonSectionComponent implements AfterViewInit,customSecInterface {

  @Input() onSubmit!: (data: any) => Promise<any>;
  @Output() onSubmitChange = new EventEmitter<(data: any) => Promise<any>>();

  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();

  @Input() triggerCustomSecSubmit: Subject<any>;
  @Output() triggerCustomSecSubmitChange = new EventEmitter<Subject<any>>();

  render = false;
  classification ?: FormControl
  rank ?: FormControl
  kingdom ?: FormControl
  subkingdom ?: FormControl
  phylum ?: FormControl
  subphylum ?: FormControl

  superclass ?: FormControl
  class ?: FormControl
  subclass ?: FormControl
  superorder ?: FormControl
  order ?: FormControl
  suborder ?: FormControl
  infraorder ?: FormControl
  superfamily ?: FormControl
  family ?: FormControl
  subfamily ?: FormControl
  tribe ?: FormControl
  subtribe ?: FormControl
  genus ?: FormControl
  subgenus ?: FormControl
  infraspecific ?: FormControl
  species ?: FormControl
  subspecies ?: FormControl
  variety ?: FormControl
  form ?: FormControl
  typeoftreatment ?: FormControl
  parasiteof ?: FormControl
  hostof ?: FormControl
  symbioticwith ?: FormControl
  feedson ?: FormControl
  groupone ?: FormControl
  grouptwo ?: FormControl


  authorandyear ?: FormControl
  text1Control ?: FormControl
  text2Control  ?: FormControl
  taxonauthorsandyear ?: FormControl


  constructor(
    private treeService: TreeService,
    public http: HttpClient,
    private serviceShare: ServiceShare
  ) {
  }

  ngAfterViewInit(): void {
    this.classification = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('classification')?.value)
    this.rank = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('rank')?.value)
    this.subkingdom = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('subkingdom')?.value)

    this.superclass = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('superclass')?.value)
    this.class = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('class')?.value)
    this.subclass = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('subclass')?.value)
    this.superorder = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('superorder')?.value)
    this.order = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('order')?.value)
    this.suborder = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('suborder')?.value)
    this.infraorder = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('infraorder')?.value)
    this.superfamily = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('superfamily')?.value)
    this.family = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('family')?.value)
    this.subfamily = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('subfamily')?.value)
    this.tribe = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('tribe')?.value)
    this.subtribe = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('subtribe')?.value)
    this.genus = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('genus')?.value)
    this.subgenus = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('subgenus')?.value)
    this.infraspecific = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('infraspecific')?.value)
    this.species = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('species')?.value)
    this.subspecies = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('subspecies')?.value)
    this.variety = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('variety')?.value)
    this.form = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('form')?.value)
    this.phylum = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('phylum')?.value)
    this.subphylum = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('subphylum')?.value)
    this.authorandyear = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('authorandyear')?.value)
    this.kingdom = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('kingdom')?.value)
    this.typeoftreatment = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('typeoftreatment')?.value)
    this.hostof = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('hostof')?.value)
    this.symbioticwith = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('symbioticwith')?.value)
    this.feedson = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('feedson')?.value)
    this.parasiteof = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('parasiteof')?.value)
    this.groupone = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('groupone')?.value)
    this.grouptwo = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('grouptwo')?.value)
    this.text1Control = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('textField')?.value)
    this.text2Control = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('textField1')?.value)
    this.taxonauthorsandyear = new FormControl(this.treeService.sectionFormGroups[this.section.sectionID].get('taxonauthorsandyear')?.value)
    this.render = true;

    this.triggerCustomSecSubmit.subscribe(()=>{
      this.triggerSubmit()
    })
  }

  async triggerSubmit() {
    let data = {
      classification: this.classification!.value,
      rank: this.rank!.value,
      subkingdom: this.subkingdom!.value,
      subphylum: this.subphylum!.value,
      phylum: this.phylum!.value,
      kingdom: this.kingdom!.value,
      authorandyear: this.authorandyear!.value,

      superclass: this.superclass!.value,
      class: this.class!.value,
      subclass: this.subclass!.value,
      superorder: this.superorder!.value,
      order: this.order!.value,
      suborder: this.suborder!.value,
      infraorder: this.infraorder!.value,
      superfamily: this.superfamily!.value,
      family: this.family!.value,
      subfamily: this.subfamily!.value,
      tribe: this.tribe!.value,
      subtribe: this.subtribe!.value,
      genus: this.genus!.value,
      subgenus: this.subgenus!.value,
      infraspecific: this.infraspecific!.value,
      species: this.species!.value,
      subspecies: this.subspecies!.value,
      variety: this.variety!.value,
      form: this.form!.value,
      typeoftreatment: this.typeoftreatment!.value,
      hostof: this.hostof!.value,
      symbioticwith: this.symbioticwith!.value,
      parasiteof: this.parasiteof!.value,
      feedson: this.feedson!.value,
      groupone: this.groupone!.value,
      grouptwo: this.grouptwo!.value,

      textField: this.text1Control!.value,
      textField1: this.text2Control!.value,
      taxonauthorsandyear: this.taxonauthorsandyear!.value,
      taxonTitle: 'TaxonTitle'
    }
    let title = [];
    if (data.rank) {
      title.push(data.genus);
      if(data.subgenus) {
        title.push(`(${data.subgenus})`);
      }
      if(data.species) {
        title.push(data.species);
      }
      if(data.rank === 'variety') {
        title.push('var.')
      }
      if(data.rank === 'variety') {
        title.push(`var. ${data.variety}`);
      }
      if(data.rank === 'form') {
        title.push(`f. ${data.form}`);
      }
      title.push(data.authorandyear);
      if(data.rank === 'species') {
        title.push('sp.')
      }
      if(data.rank === 'genus' && data.typeoftreatment === 'New taxon') {
        title.push('gen., n.')
      }
    }
    data.taxonTitle = title.join('&nbsp;');
    this.treeService.sectionFormGroups[this.section.sectionID].get('taxonTitle').setValue(data.taxonTitle)
    this.onSubmit({data});
  }
}
