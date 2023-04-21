import { HttpClient } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';

import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema } from '@app/editor/utils/Schema';

import { ServiceShare } from '@app/editor/services/service-share.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';
import { editorContainer } from '@app/editor/utils/interfaces/editor-container';

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

  sectionData;
  editorView: EditorView;

  @ViewChild('funderContent', { read: ElementRef }) funderContent?: ElementRef;
  @ViewChild('refinditsearch', { read: ElementRef }) refinditsearch?: ElementRef;
  funderContentPmContainer: editorContainer;

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

  /**
    addCustomSectionData(section:articleSection,data:any){
    let customPropsObj = this.ydocService.customSectionProps?.get('customPropsObj');
    customPropsObj[section.sectionID] = data;
    this.ydocService.customSectionProps?.set('customPropsObj',customPropsObj);
  }
   */

  ngAfterViewInit(): void {
    let header = this.funderContent?.nativeElement;

    this.sectionData = this.serviceShare.YdocService.customSectionProps.get("customPropsObj")[this.section.sectionID];

    this.funderContentPmContainer =
    this.serviceShare.ProsemirrorEditorsService
      .renderSeparatedEditorWithNoSync(
        header, 'popup-menu-container',
        // this.sectionData?.funderData
        // ?
        // this.sectionData?.funderData
        // :
        schema.nodes.paragraph
          .create({},schema.text(
            this.sectionData?.data
            ?
            this.sectionData.data
            :
            'Type component description here.'
          ))
      )

      this.editorView = this.funderContentPmContainer.editorView;

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
      const state = this.editorView.state;
      this.editorView.focus();
      this.editorView.dispatch(state.tr.setSelection(new TextSelection(state.doc.resolve(state.doc.content.size - 1), state.doc.resolve(state.doc.content.size - 1))));
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

    /*
      {
      responseType: 'text',
      params: {
        search: 'simple',
        text: searchText,
      }
    */

    this.oldSub = this.http.get('http://mock-data.com/', {
      responseType: "text",
      params:{
        search: searchText,
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
      return option.title + " | " + option.first_author  + " | " + option.year;
      // return option?.ref?.title || option?.refData?.referenceData?.title + ' | ' +
      //   (option?.refData?.formioData?.authors[0] ? (option?.refData?.formioData?.authors[0]?.first || option?.refData?.formioData?.authors[0]?.last || option?.refData?.formioData?.authors[0]?.given) : 'no name') + ' | ' +
      //   option.refData.referenceData.type;
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
    // serviceShare.ProsemirrorEditorsService.editorContainers /JATS/

    //@ts-ignore
    let path = this.editorView.state.selection.$from.path;

    let funderData;
    let counter = 0;

    while(!funderData && counter < path.length){
      let node = path[counter]
      let nodeTag = node.type.name;
      if(nodeTag == "paragraph"){
        funderData = node.content?.content[0]?.text || "";
      }
      counter+=3
    }

    this.onSubmit({ data: { data: funderData } })
  }
}
