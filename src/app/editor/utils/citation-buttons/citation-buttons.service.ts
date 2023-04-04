import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { EditorState, Plugin, PluginKey, TextSelection, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { RefsInArticleDialogComponent } from '@app/editor/dialogs/refs-in-article-dialog/refs-in-article-dialog.component';
import { RefsInArticleCiteDialogComponent } from '@app/editor/dialogs/refs-in-article-cite-dialog/refs-in-article-cite-dialog.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { FiguresDialogComponent } from '@app/editor/dialogs/figures-dialog/figures-dialog.component';
import { SupplementaryFilesDialogComponent } from '@app/editor/dialogs/supplementary-files/supplementary-files.component';
import { EndNotesDialogComponent } from '@app/editor/dialogs/end-notes/end-notes.component';
import { CitableTablesDialogComponent } from '@app/editor/dialogs/citable-tables-dialog/citable-tables-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class CitationButtonsService {
  citationButtonsPluginKey = new PluginKey('citationButtonsPlugin');
  citationButtonsPlugin: Plugin;
  citationElementsNodeNames = ["citation", "supplementary_file_citation", "table_citation", "end_note_citation"];

  citableElementsDialogs = {
    "citation": FiguresDialogComponent,
    "supplementary_file_citation": SupplementaryFilesDialogComponent,
    "table_citation": CitableTablesDialogComponent,
    "end_note_citation": EndNotesDialogComponent
  }

  citationNodeNamesAndButtonsTitles = {
    "citation": "Edit Figures",
    "supplementary_file_citation": "Edit Supplementary Files",
    "table_citation": "Edit Tables",
    "end_note_citation": "Edit End Notes",
  }

  constructor(private serviceShare: ServiceShare, private dialog: MatDialog) {
    const self = this;
    serviceShare.shareSelf("citationButtonsService", this);
    this.citationButtonsPlugin = new Plugin({
      key: this.citationButtonsPluginKey,
      state: {
        init: (config: any, _: EditorState) => {
          return { sectionName: config.sectionName, editorType: config.editorType ? config.editorType : undefined};
        },
        apply: (transaction: Transaction, value, _, newState) => {
          return value;
        },
      },
      props: {
        handleClick(view: EditorView, pos: number, event: MouseEvent) {
          const $pos = view.state.doc.resolve(pos);
          const { parent, parentOffset } = $pos;
          let from: number;
          let to: number;          
           
          if (parent && parent.type.name == "reference_citation") {
            from = $pos.start();
            to = from + parent.nodeSize;            

            const newSelection = view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to - 1));
            view.dispatch(newSelection);
          } else {
            const { node, offset } = parent.childAfter(parentOffset);
            if(!node) return;
            if(!node.marks || !node.marks.find(mark => self.citationElementsNodeNames.includes(mark.type.name))) {
              return;
            }
            
            from = $pos.start() + offset;
            to = from + node.nodeSize;

            let tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, from, to));
            view.dispatch(tr);            
          }
        },
      },
      view: function(view: EditorView) {
        return {
          update: (view: EditorView, prevState) => {
            if (JSON.stringify(view.state.doc) == JSON.stringify(prevState.doc) && !view.hasFocus()) {
              return;
            }            

            self.attachCitationRefButtons(view);
          },
          destroy: () => {}
        }
      }
    });
  }

  attachCitationRefButtons(view: EditorView) {
    const anchor = view.state.selection.$anchor;
    const referenceCitationInfo = this.citeRefPosition(view.state, anchor.pos);
    const mark = this.findCitationMark(view, anchor.pos);
    const { from, to } = view.state.selection;

    const btnsWrapper = document.getElementsByClassName('editor_buttons_wrapper')[0] as HTMLDivElement
    const editCitableElementsContainer = btnsWrapper.getElementsByClassName('citable-items-edit-btn-container')[0] as HTMLDivElement;
    const editCitationBtnContainer = btnsWrapper.getElementsByClassName('edit-cite-ref-btn-container')[0] as HTMLDivElement;
    const deleteCitationBtnContainer = btnsWrapper.getElementsByClassName('delete-citation-btn-container')[0] as HTMLDivElement;
    
    if(mark && from != to) {
      // this.serviceShare.TaxonService.canShowTaxonButtons.next(false);
      editCitableElementsContainer.style.display = "block";
      editCitationBtnContainer.style.display = "none";
      deleteCitationBtnContainer.style.display = "none";

      const editCitableElementsButton = editCitableElementsContainer.getElementsByClassName('edit-citable-button')[0] as HTMLButtonElement;
      editCitableElementsButton.title = this.citationNodeNamesAndButtonsTitles[mark.type.name];

      editCitableElementsButton.removeAllListeners!("click");
      editCitableElementsButton.addEventListener("click", (event: MouseEvent) => {
      
      this.dialog.open(this.citableElementsDialogs[mark.type.name] as any, {
        data: {},
        disableClose: false
      })
    })
      return;
    } else if (referenceCitationInfo && from != to) {
      // this.serviceShare.TaxonService.canShowTaxonButtons.next(false);
      const editReferenceItemBtn = editCitableElementsContainer.getElementsByClassName('edit-citable-button')[0] as HTMLButtonElement;
      const editCitationBtn = editCitationBtnContainer.getElementsByClassName('edit-cite-ref-button')[0] as HTMLButtonElement;
      const deleteCitationBtn = deleteCitationBtnContainer.getElementsByClassName('delete-citation-btn')[0] as HTMLButtonElement;

      editReferenceItemBtn.title = "Edit References";
      editCitableElementsContainer.style.display = "block";
      editCitationBtnContainer.style.display = "block";
      deleteCitationBtnContainer.style.display = "block";

      editReferenceItemBtn.removeAllListeners!("click");
      editCitationBtn.removeAllListeners!("click");
      deleteCitationBtn.removeAllListeners!("click");

      editReferenceItemBtn.addEventListener("click", (event: MouseEvent) => {
        this.dialog.open(RefsInArticleDialogComponent, {
          data: {},
          disableClose: false
        })
      })

      editCitationBtn.addEventListener("click", (event: MouseEvent) => {
          // const referenceCitationInfo = citeRefPosition(view.state, anchor.pos);
          // if(!referenceCitationInfo) return;
          const { from, referenceCitation } = referenceCitationInfo;
          const { citedRefsCiTOs, citedRefsIds, citationStyle } = referenceCitation.attrs;
          const texts = referenceCitation.textContent.split(', ');
          const data = citedRefsIds.map((refCitationID: string, i: number) => ({ text: texts[i], refCitationID, citationStyle }))
          

          this.dialog.open(RefsInArticleCiteDialogComponent, {
              panelClass: 'editor-dialog-container',
              data: { data, citedRefsCiTOs, isEditMode: true },
              width: '680px',
            })
            .afterClosed()
            .subscribe((result) => {
              if (result) {                
                const citationObj = {
                  citedRefsIds,
                  citationNode: referenceCitation,
                  citationPos: from,
                };

                this.serviceShare.EditorsRefsManagerService.citateSelectedReferencesInEditor(
                  result.citedRefs,
                  view,
                  true,
                  citationObj
                );
              }
              btnsWrapper.style.display = "none";
            });
      })

      deleteCitationBtn.addEventListener("click", (event: MouseEvent) => {
          // const referenceCitationInfo = citeRefPosition(view.state, anchor.pos);
          // if(!referenceCitationInfo) return;
          const { from, referenceCitation } = referenceCitationInfo;

          const tr = view.state.tr.deleteRange(
            from - 1,
            from + referenceCitation.nodeSize - 1
          );
          view.dispatch(tr.setMeta("deleteRefCitation", true));
          btnsWrapper.style.display = "none";
      })
    }    
    if((!referenceCitationInfo && !mark) || from == to) {
      editCitableElementsContainer.style.display = "none";
      editCitationBtnContainer.style.display = "none";
      deleteCitationBtnContainer.style.display = "none";
    }
    if(this.citationButtonsPluginKey.getState(view.state).editorType == "popupEditor") {
      btnsWrapper.style.display = "none";
    }
  }
  
  citeRefPosition(state: EditorState, pos: number) {
    
    const $pos = state.doc.resolve(pos);
    const { parent: node } = $pos;
    if (!node || node.type.name !== 'reference_citation') return;
    const from = $pos.start();

    return { from, referenceCitation: node };
  }

  findCitationMark(view: EditorView, pos: number) {
    const $pos = view.state.doc.resolve(pos);
    const { parent, parentOffset } = $pos;
    const { node } = parent.childAfter(parentOffset);
    return node && node.marks?.find((mark => this.citationElementsNodeNames.includes(mark.type?.name)));
  }
}
