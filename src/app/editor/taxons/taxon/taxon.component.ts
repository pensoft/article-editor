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
    this.sharedService.TaxonService.lastSelectedTaxonMarkSubject.subscribe((taxon) => {
      if(this.ydocService.curUserAccess&&this.ydocService.curUserAccess=='Viewer'){
        return
      }
      if (this.taxon.taxonMarkId == taxon.taxonMarkId) {
        this.selected.emit(true);
      } else {
        this.selected.emit(false);
      }
    })
  }

  ngOnInit(): void {
  }

  removeThisTaxon(){
    this.sharedService.TaxonService.removeSingleTaxon(this.taxon)
  }

  removeAllOccurrencesOfTaxon(){
    this.sharedService.TaxonService.removeAllTaxon(this.taxon)
  }

  selectTaxon() {
    let view = this.sharedService.ProsemirrorEditorsService.editorContainers[this.taxon.section].editorView;
    let actualTaxon: taxonMarkData
    let allTaxons = this.sharedService.TaxonService.taxonsMarksObj
    Object.keys(allTaxons).forEach((taxonid) => {
      let tax = allTaxons[taxonid]
      if (tax && tax.taxonMarkId == this.taxon.taxonMarkId) {
        actualTaxon = tax
      }
    })
    if (actualTaxon) {
      view.focus()
      view.dispatch(view.state.tr.setSelection(new TextSelection(view.state.doc.resolve(actualTaxon.pmDocStartPos), view.state.doc.resolve(actualTaxon.pmDocEndPos))).setMeta('selected-comment',true))
      this.sharedService.ProsemirrorEditorsService.dispatchEmptyTransaction()
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.doneRenderingTaxonsSubject.next('rendered')
    }, 10)
  }
}
