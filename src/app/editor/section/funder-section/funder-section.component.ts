import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';
import { schema } from '@app/editor/utils/Schema';
import { environment } from '@env';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

export interface customSecInterface{
  triggerSubmit:()=>void
}

@Component({
  selector: 'app-funder-section',
  templateUrl: './funder-section.component.html',
  styleUrls: ['./funder-section.component.scss']
})
export class FunderSectionComponent implements OnInit,customSecInterface,AfterViewInit {

  @Input() onSubmit!: (data: any) => Promise<any>;
  @Output() onSubmitChange = new EventEmitter<(data: any) => Promise<any>>();

  @Input() section!: articleSection;
  @Output() sectionChange = new EventEmitter<articleSection>();

  @Input() triggerCustomSecSubmit: Subject<any>;
  @Output() triggerCustomSecSubmitChange = new EventEmitter<Subject<any>>();

  @ViewChild('funderContent', { read: ElementRef }) funderContent?: ElementRef;
  @ViewChild('refinditsearch', { read: ElementRef }) refinditsearch?: ElementRef;
  funderContentPmContainer

  searchReferencesControl = new FormControl('');
  loading = false;
  searchData: any
  externalSelection: any
  lastSelect: 'external' | 'localRef' | 'none' = 'none';
  constructor(
    private serviceShare:ServiceShare,
    private http: HttpClient,
    private ref:ChangeDetectorRef
  ) { }

  ngAfterViewInit(): void {
    let header = this.funderContent?.nativeElement
    this.funderContentPmContainer = this.serviceShare.ProsemirrorEditorsService.renderSeparatedEditorWithNoSync(header, 'popup-menu-container', schema.nodes.paragraph.create({},schema.text('Type component description here.')))
    //@ts-ignore
    this.funderContentPmContainer.editorView.isPopupEditor = true;
    this.searchReferencesControl.valueChanges.pipe(
      filter(Boolean),
      debounceTime(700),
      distinctUntilChanged(),
    ).subscribe((value: any) => {
      if (this.externalSelection !== value) {
        this.searchExternalRefs(value);
      }
    });
    setTimeout(()=>{
      this.refinditsearch.nativeElement.focus()
      this.ref.detectChanges()
    },40)
    this.triggerCustomSecSubmit.subscribe(()=>{
      this.triggerSubmit()
    })
  }

  oldSub?: Subscription
  searchExternalRefs(searchText: string) {
    if (this.oldSub) {
      this.oldSub.unsubscribe()
    }
    this.searchData = undefined;
    this.loading = true;
    this.ref.detectChanges()
    this.oldSub = this.http.get(environment.EXTERNAL_REFS_API, {
      responseType: 'text',
      params: {
        search: 'simple',
        text: searchText,
      }
    }).subscribe((data1) => {
      let parsedJson = JSON.parse(data1);
      if (parsedJson.length > 0) {
        this.searchData = parsedJson;
        this.loading = false;
        this.ref.detectChanges()
      }
    })
  }

  displayFn(option: any): string {
    if (option) {
      return option?.ref?.title || option?.refData?.referenceData?.title + ' | ' +
        (option?.refData?.formioData?.authors[0] ? (option?.refData?.formioData?.authors[0]?.first || option?.refData?.formioData?.authors[0]?.last || option?.refData?.formioData?.authors[0]?.given) : 'no name') + ' | ' +
        option.refData.referenceData.type;
    }
    return '';
  }

  select(row: any, lastSelect) {
    this.lastSelect = lastSelect;
    this.getRefWithCitation([row],'refindit')
  }
  getRefWithCitation(selected:any[],source:string){
    console.log('selected from search',selected,source);
  }
  ngOnInit(): void {
  }

  triggerSubmit(){
    this.onSubmit({data:{asd:'asd'}})
  }
}
