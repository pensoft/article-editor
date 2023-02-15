import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { TextSelection } from 'prosemirror-state';
import { Subject } from 'rxjs';
import { taxonMarkData } from '../taxon.service';

@Component({
  selector: 'app-taxon',
  templateUrl: './taxon.component.html',
  styleUrls: ['./taxon.component.scss']
})
export class TaxonComponent implements OnInit,AfterViewInit {

  @Input() taxon?: taxonMarkData;

  @Input() doneRenderingTaxonsSubject?: Subject<any>;
  @Output() doneRenderingTaxonsSubjectChange = new EventEmitter<Subject<any>>();

  @Output() selected = new EventEmitter<boolean>();
  previewMode
  constructor(
    private sharedService:ServiceShare,
    public ydocService:YdocService
  ) {
    this.previewMode = sharedService.ProsemirrorEditorsService!.previewArticleMode
  }

  ngOnInit(): void {
  }

  removeThisTaxon(){
    console.log('removeThisTaxon');
  }

  removeAllOccurrencesOfTaxon(){
    console.log('removeAllOccurrencesOfTaxon');
  }

  selectComment() {
    let view = this.sharedService.ProsemirrorEditorsService.editorContainers[this.taxon.section].editorView;
    let actualComment: taxonMarkData
    let allComments = this.sharedService.TaxonService.taxonsMarksObj
    Object.keys(allComments).forEach((commentid) => {
      let com = allComments[commentid]
      if (com && com.taxonMarkId == this.taxon.taxonMarkId) {
        actualComment = com
      }
    })
    if (actualComment) {
      view.focus()
      view.dispatch(view.state.tr.setSelection(new TextSelection(view.state.doc.resolve(actualComment.pmDocStartPos), view.state.doc.resolve(actualComment.pmDocEndPos))).setMeta('selected-comment',true))
      this.sharedService.ProsemirrorEditorsService.dispatchEmptyTransaction()
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.doneRenderingTaxonsSubject.next('rendered')
    }, 10)
  }
}
