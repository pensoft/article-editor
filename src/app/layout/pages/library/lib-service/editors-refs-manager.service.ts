import { E } from '@angular/cdk/keycodes';
import { Injectable } from '@angular/core';
import { clearRefFromFormControl } from '@app/editor/dialogs/refs-in-article-dialog/refs-in-article-dialog.component';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { PMDomParser } from '@app/editor/utils/Schema';
import { uuidv4 } from 'lib0/random';
import { endsWith, keys } from 'lodash';
import { DOMParser, DOMSerializer, Fragment, Node, Schema } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

export let CiToTypes = [
  { label: "agrees with", link: "http://purl.org/spar/cito/agreesWith" },
  { label: "cites as authority", link: "http://purl.org/spar/cito/citesAsAuthority" },
  { label: "cites as recommended reading", link: "http://purl.org/spar/cito/citesAsRecommendedReading" },
]

export function getHtmlInlineNodes(htmlSteing: string) {
  let container = document.createElement('p');
  let html = htmlSteing.replace(/<p[^>]+>|<div[^>]+>|<\/p>|<\/div>/gm, '');
  container.innerHTML = html;
  let nodes = PMDomParser.parseSlice(container)
  //@ts-ignore
  return nodes.content.content
}

@Injectable({
  providedIn: 'root'
})

export class EditorsRefsManagerService {

  constructor(private serviceShare: ServiceShare) {
    this.serviceShare.shareSelf('EditorsRefsManagerService', this)
  }

  dothSaveToHistory = false;

  citateSelectedReferencesInEditor(citedRefs: string[], view: EditorView, citedRefsAtPos?: {
    citedRefsAtPos: string[],
    citationAtPos: Node,
    citationPos: number
  }) {

    let refsInYdoc = this.serviceShare.YdocService.referenceCitationsMap.get('refsAddedToArticle');
    let props = { refsInYdoc }

    let state = view.state;
    let sel = state.selection;
    let schema = state.schema as Schema;

    let nodeAttrs = {
      refCitationID: uuidv4(),
      citedRefsIds: citedRefs,
      contenteditableNode: false
    }

    let refsTxts: string[] = Object.keys(refsInYdoc).reduce<string[]>((prev: string[], key: string, i: number) => {
      if (citedRefs.includes(key)) {
        let ref = refsInYdoc[key];
        prev.push(ref.citation.data.text)
      }
      return prev
    }, []);

    this.serviceShare.YjsHistoryService.captureBigOperation();

    let citationTxt = schema.text(refsTxts.join(', '));
    if (!citedRefsAtPos) {
      view.dispatch(state.tr.replaceSelectionWith(schema.nodes.reference_citation.create(nodeAttrs, citationTxt)));
    } else {
      view.dispatch(state.tr.replaceWith(citedRefsAtPos.citationPos, citedRefsAtPos.citationPos + citedRefsAtPos.citationAtPos.nodeSize, schema.nodes.reference_citation.create(nodeAttrs, citationTxt)))
    }
    this.checkIfAnyRefsShouldBeAddedToEndEditor();
    //this.checkIfAnyRefsShouldBeRemovedFromEndEditor();
    this.checkIfShouldUpdateRefs();

    this.serviceShare.YjsHistoryService.endBigOperationCapture()
  }

  updateRefsInEndEditorAndTheirCitations() {
    this.checkIfAnyRefsShouldBeAddedToEndEditor();
    //this.checkIfAnyRefsShouldBeRemovedFromEndEditor();
    this.checkIfShouldUpdateRefs();
  }

  checkIfShouldUpdateRefs() {
    let refsInEndEditor = this.serviceShare.YdocService!.referenceCitationsMap?.get('referencesInEditor');
    let refsInArticle = this.serviceShare.YdocService.referenceCitationsMap.get('refsAddedToArticle');


    let refsThatViewsShouldBeUpdated = {};
    let deletedRefs = {}
    Object.keys(refsInEndEditor).forEach((refId) => {
      if (!refsInArticle[refId]) {
        deletedRefs[refId] = refsInEndEditor[refId]
      } else if (
        refsInEndEditor[refId].citation.textContent != refsInArticle[refId].citation.textContent ||
        refsInEndEditor[refId].refStyle.name != refsInArticle[refId].refStyle.name ||
        refsInEndEditor[refId].refStyle.last_modified != refsInArticle[refId].refStyle.last_modified ||
        refsInEndEditor[refId].refStyle.label != refsInArticle[refId].refStyle.label ||
        refsInEndEditor[refId].refType.last_modified != refsInArticle[refId].refType.last_modified ||
        refsInEndEditor[refId].refType.refTypeId != refsInArticle[refId].refType.refTypeId ||
        refsInEndEditor[refId].refType.type != refsInArticle[refId].refType.type ||
        refsInEndEditor[refId].ref_last_modified != refsInArticle[refId].ref_last_modified
      ) {
        refsThatViewsShouldBeUpdated[refId] = refsInArticle[refId]
      }
    })

    let idsOfRefsForUpdate = Object.keys(refsThatViewsShouldBeUpdated)
    if (idsOfRefsForUpdate.length > 0) {
      idsOfRefsForUpdate.forEach((key) => {
        refsInEndEditor[key] = refsInArticle[key]
      })
    }

    let deleatedRefsIds = Object.keys(deletedRefs)
    if (deleatedRefsIds.length > 0) {
      let newRefsInEdnEditor = {}
      Object.keys(refsInEndEditor).forEach((key) => {
        if (!deleatedRefsIds.includes(key)) {
          newRefsInEdnEditor[key] = refsInEndEditor[key]
        }
      })
      refsInEndEditor = newRefsInEdnEditor;
    }

    let refsWithNoFormControls = clearRefFromFormControl(refsInEndEditor)
    this.serviceShare.YdocService!.referenceCitationsMap?.set('referencesInEditor', refsWithNoFormControls);

    Object.keys(refsInEndEditor).forEach((key) => {
      refsInEndEditor[key].originalDisplayText = refsInEndEditor[key].citation.data.text;
      refsInEndEditor[key].originalBibliography = refsInEndEditor[key].citation.bibliography;
      refsInEndEditor[key].displayHTMLOriginal = refsInEndEditor[key].citation.textContent;
    })
    this.updateCitationsDisplayTextAndBibliography(refsInEndEditor)

    deleatedRefsIds.forEach((refId) => {
      this.removeBibliographyOfDeletedRef(refId);
    })
  }

  removeBibliographyOfDeletedRef(refId: string) {
    let endEdView = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'].editorView;

    let node: any;
    let from: any;
    let to: any;

    let state = endEdView.state;

    let docsize = state.doc.content.size
    let end_editor_refs_container
    state.doc.nodesBetween(0, docsize - 1, (n, pos, parent, index) => {
      if (n.type.name == 'reference_citation_end' && n.attrs.referenceData.refId == refId) {
        node = n
        from = pos;
        to = n.nodeSize + pos;
      }else if(n.type.name == 'reference_container'){
        end_editor_refs_container = n
      }
    })
    if (node) {
      if(end_editor_refs_container && end_editor_refs_container.content.childCount == 1){
        from = from - 19
        to = to+1
      }
      endEdView.dispatch(state.tr.replaceWith(from - 1, to + 1, Fragment.empty).setMeta('skipChange', true));
    }
  }

  updateCitationsDisplayTextAndBibliography(refs: any) {
    let countObj: any = {}

    let updatedAnyDisplayText = false
    let updatedReferences: string[] = []
    // count number of refs with the same citation display text ex. : (Author 2022)

    Object.keys(refs).forEach((refId) => {
      let ref = refs[refId]
      let cictatDispTxt = ref.originalDisplayText;
      if (!countObj[cictatDispTxt]) {
        countObj[cictatDispTxt] = 1;
      } else {
        countObj[cictatDispTxt]++;
      }
    })

    // change all citationDisplayText for all refs that have the same originalDisplayText

    Object.keys(countObj).forEach((text) => {
      if (countObj[text] > 1) {
        updatedAnyDisplayText = true
        let count = 1;
        Object.keys(refs).forEach((refId) => {
          let ref = refs[refId]
          if (ref.originalDisplayText == text) {
            updatedReferences.push(refId)
            let char = String.fromCharCode(96 + count)
            let citationDisText = this.checkTextAndReplace(ref.originalDisplayText, char)
            ref.citationDisplayText = citationDisText
            let bibliography = this.checkTextAndReplace(ref.originalBibliography, char)
            let html = this.checkTextAndReplace(ref.displayHTMLOriginal, char)
            ref.bibliography = bibliography
            ref.displayHTML = html
            count++;
          }
        })
      } else {
        updatedAnyDisplayText = true
        Object.keys(refs).forEach((refId) => {
          let ref = refs[refId]
          if (ref.originalDisplayText == text) {
            updatedReferences.push(refId)
            ref.citationDisplayText = ref.originalDisplayText
            ref.bibliography = ref.originalBibliography
            ref.displayHTML = ref.displayHTMLOriginal
          }
        })
      }

    })

    if (updatedAnyDisplayText) {
      setTimeout(() => {
        this.updateReferenceCitats(updatedReferences, refs);
      }, 10)
    }
    this.checkIfShouldMarkRefsCitationsAsDeleted(refs)
    return refs
  }

  checkIfShouldMarkRefsCitationsAsDeleted(refs: any) {
    Object.keys(this.serviceShare.ProsemirrorEditorsService!.editorContainers).forEach((sectionId) => {
      let edView = this.serviceShare.ProsemirrorEditorsService!.editorContainers[sectionId].editorView
      let allCitationsWithNonExistentRefs = this.getAllCitationsIdsWithNonExistantRefs(edView, refs)
      allCitationsWithNonExistentRefs.forEach((citeId) => {
        this.markRefCitationAsPointionToDeletedRef(edView, refs, citeId)
      })
    })
  }

  markRefCitationAsPointionToDeletedRef(view: EditorView, refs: any, citeId: string) {
    let edView = view;

    let node: any;
    let from: any;
    let to: any;

    let state = edView.state;
    let found = false;
    let docSize = state.doc.content.size

    state.doc.nodesBetween(0, docSize - 1, (n, p, par, i) => {
      if (n.type.name == 'reference_citation' && n.attrs.refCitationID == citeId) {
        found = true
        node = n;
        from = p;
        to = n.nodeSize + p;
      }
    })
    if (found) {
      let attrs = JSON.parse(JSON.stringify(node.attrs));
      attrs.citedRefsIds = ['pointing-to-deleted-ref']
      attrs.nonexistingelement = true;
      let newNode = state.schema.nodes.reference_citation.create(attrs, state.schema.text(' Cited item deleted '))
      edView.dispatch(state.tr.replaceWith(from, to, newNode).setMeta('addToLastHistoryGroup', true));
    }
  }

  getAllCitationsIdsWithNonExistantRefs(view: EditorView, refs: any) {
    let edView = view;
    let state = edView.state;
    let docSize = state.doc.content.size

    let citaitonIds = []
    state.doc.nodesBetween(0, docSize - 1, (n, p, par, i) => {
      if (n.type.name == 'reference_citation' && !n.attrs.citedRefsIds.reduce((prev, curr) => { return (refs[curr] && prev) }, true) && (n.attrs.nonexistingelement == false || n.attrs.nonexistingelement == 'false')) {
        let citationId = n.attrs.refCitationID;
        citaitonIds.push(citationId)
      }
    })
    return citaitonIds
  }

  updateReferenceCitats(updatedReferences: string[], refs: any) {
    //update refs bibliography in end editor
    updatedReferences.forEach((refid) => {
      this.updateBibliography(refs, refid)
    })
    //update citation of refs
    Object.keys(this.serviceShare.ProsemirrorEditorsService!.editorContainers).forEach((sectionId) => {
      let edView = this.serviceShare.ProsemirrorEditorsService!.editorContainers[sectionId].editorView
      let allRefsCitationIdsInEditors = this.getAllCitationsIdsInEditor(edView)
      allRefsCitationIdsInEditors.forEach((citeId) => {
        this.updateRefsCitationsInEditor(edView, refs, citeId)
      })
    })
  }

  getAllCitationsIdsInEditor(view: EditorView) {
    let edView = view;
    let state = edView.state;
    let docSize = state.doc.content.size

    let citaitonIds = []
    state.doc.nodesBetween(0, docSize - 1, (n, p, par, i) => {
      if (n.type.name == 'reference_citation') {
        let citationId = n.attrs.refCitationID;
        citaitonIds.push(citationId)
      }
    })
    return citaitonIds
  }

  updateRefsCitationsInEditor(view, refs, citeId) {
    let edView = view;

    let node: any;
    let from: any;
    let to: any;

    let state = edView.state;
    let found = false;
    let citatNewTxt;
    let docSize = state.doc.content.size

    let allRefsIds = Object.keys(refs)
    state.doc.nodesBetween(0, docSize - 1, (n, p, par, i) => {
      if (n.type.name == 'reference_citation' && n.attrs.refCitationID == citeId && n.attrs.citedRefsIds.some(x=>allRefsIds.includes(x))) {
        let citationTextContent = n.textContent;
        let citationCurrTextContent: string = allRefsIds.reduce<string[]>((prev: string[], key: string, i: number) => {
          if (n.attrs.citedRefsIds.includes(key)) {
            let ref = refs[key];
            prev.push(ref.citationDisplayText)
          }
          return prev
        }, []).join(', ');
        if (citationTextContent != citationCurrTextContent) {
          citatNewTxt = citationCurrTextContent
          found = true
          node = n;
          from = p;
          to = n.nodeSize + p;
        }
      }
    })
    if (found) {
      let attrs = JSON.parse(JSON.stringify(node.attrs));
      attrs.citedRefsIds = attrs.citedRefsIds.filter(x => allRefsIds.includes(x));
      let newNode = state.schema.nodes.reference_citation.create(attrs, state.schema.text(citatNewTxt))
      edView.dispatch(state.tr.replaceWith(from, to, newNode).setMeta('addToLastHistoryGroup', true));
    }
  }

  updateBibliography(ydocRefs: any, refId: string) {
    let endEdView = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'].editorView;

    let node: any;
    let from: any;
    let to: any;

    let state = endEdView.state;

    let docsize = state.doc.content.size
    state.doc.nodesBetween(0, docsize - 1, (n, pos, parent, index) => {
      if (n.type.name == 'reference_citation_end' && n.attrs.referenceData.refId == refId) {
        node = n
        from = pos;
        to = n.nodeSize + pos;
      }
    })
    if (node) {
      let attrs = JSON.parse(JSON.stringify(node.attrs));
      let newNode = state.schema.nodes.reference_citation_end.create(attrs, getHtmlInlineNodes(ydocRefs[refId].displayHTML))
      endEdView.dispatch(state.tr.replaceWith(from, to, newNode).setMeta('skipChange', true));
    }
  }

  checkIfAnyRefsShouldBeRemovedFromEndEditor() {
    let refsIdsInEndEditor: string[] = [];
    let view = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'].editorView;

    let doc = view.state.doc
    let start = 0;
    let end = doc.content.size;
    doc.nodesBetween(start, end, (node) => {
      if (node.type.name == 'reference_citation_end') {
        if (!refsIdsInEndEditor.includes(node.attrs.referenceData.refId)) {
          refsIdsInEndEditor.push(node.attrs.referenceData.refId);
        } else {
          console.error('There are multilple references of one instance in the end editor.')
          this.removeRefFromEndEditorById(node.attrs.referenceData.refId)
        }
      }
    })
    let allcitedReferencesIdsInAllEditors: any[] = []

    Object.keys(this.serviceShare.ProsemirrorEditorsService!.editorContainers).forEach((sectionId) => {
      let view = this.serviceShare.ProsemirrorEditorsService!.editorContainers[sectionId].editorView;

      let doc = view.state.doc
      let start = 0;
      let end = doc.content.size;
      doc.nodesBetween(start, end, (node) => {
        if (node.type.name == 'reference_citation') {
          node.attrs.citedRefsIds.forEach((refId) => {
            if (!allcitedReferencesIdsInAllEditors.includes(refId)) {
              allcitedReferencesIdsInAllEditors.push(refId);
            }
          })
        }
      })
    })

      let refsIdsToRemoveFormEndEditor: string[] = refsIdsInEndEditor.filter(x => !allcitedReferencesIdsInAllEditors.includes(x));
      refsIdsToRemoveFormEndEditor.forEach((id) => {
        this.removeRefFromEndEditorById(id);
      })
  }

  removeRefFromEndEditorById(refId: string) {
    let endEditor = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'];
    let view = endEditor.editorView;
    let st = view.state;
    let refsInEndEditor = this.serviceShare.YdocService!.referenceCitationsMap?.get('referencesInEditor')
    let nOfRefs = Object.keys(refsInEndEditor).length
    let from: any;
    let to: any;
    let docSize = st.doc.content.size
    let end_editor_refs_container:Node
    if (nOfRefs == 1) {
      st.doc.nodesBetween(0, docSize - 1, (n, p, par, i) => {
        if (n.type.name == 'reference_container') {
          from = p - 18;
          to = p + n.nodeSize
          end_editor_refs_container = n
        }
      })
    } else {
      st.doc.nodesBetween(0, docSize - 1, (n, p, par, i) => {
        if (n.type.name == 'reference_citation_end' && n.attrs.referenceData.refId == refId) {
          from = p - 1;
          to = p + n.nodeSize + 1
        }else if(n.type.name == 'reference_container'){
          end_editor_refs_container = n
        }
      })
    }

    if (from || to) {

      view.dispatch(
        st.tr.replaceWith(from, to, Fragment.empty));
    }
    let refs = this.serviceShare.YdocService!.referenceCitationsMap?.get('referencesInEditor')
    let newRefs: any = {}
    Object.keys(refs).forEach((key) => {
      if (key != refId) {
        newRefs[key] = refs[key];
      }
    })

    let refsWithNoFormControls = clearRefFromFormControl(newRefs)
    this.serviceShare.YdocService!.referenceCitationsMap?.set('referencesInEditor', refsWithNoFormControls)
  }

  checkIfAnyRefsShouldBeAddedToEndEditor() {
    let allCitedRefs = this.serviceShare.YdocService!.referenceCitationsMap?.get('referencesInEditor');
    let refsInYdoc = this.serviceShare.YdocService.referenceCitationsMap.get('refsAddedToArticle');

    let refsInEndEditorKeys = Object.keys(allCitedRefs);
    let refsInArticleKeys = Object.keys(refsInYdoc);
    let newRefs = refsInArticleKeys.filter(x => !refsInEndEditorKeys.includes(x));
    newRefs.forEach((refId) => {
      let ref = refsInYdoc[refId];
      allCitedRefs[refId] = ref
    });

    let refsWithNoFormControls = clearRefFromFormControl(allCitedRefs)
    this.serviceShare.YdocService.referenceCitationsMap.set('referencesInEditor', refsWithNoFormControls);

    newRefs.forEach((refId) => {
      let ref = refsInYdoc[refId];
      this.addNewRefToEndEditor(ref);
    });

  }

  addNewRefToEndEditor(ref: any) {
    let view = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'].editorView;
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2
    let state = view.state
    let referenceContainerIsRendered = false;
    view.state.doc.forEach((node, offset, index) => {
      if (node.type.name == 'reference_container') {
        nodeStart = offset + node.nodeSize - 1
        nodeEnd = offset + node.nodeSize - 1
        referenceContainerIsRendered = true
      }
    })
    let schema: Schema = view.state.schema;
    let referenceData = { refId: ref.ref.id, last_modified: ref.ref_last_modified };
    let referenceStyle = { name: ref.refStyle.name, last_modified: ref.refStyle.last_modified };
    let referenceType = { name: ref.refType.name, last_modified: ref.refType.last_modified };
    let recCitationAttrs = {
      contenteditableNode: 'false',
      refCitationID: uuidv4(),
      referenceData,
      referenceStyle,
      referenceType
    }

    let refNode = schema.nodes.reference_citation_end.create(recCitationAttrs, getHtmlInlineNodes(ref.citation.bibliography))
    let refContainerNode = schema.nodes.reference_block_container.create({ contenteditableNode: 'false' }, refNode)
    if (!referenceContainerIsRendered) {
      let refTitle = schema.nodes.paragraph.create({ contenteditableNode: 'false' }, schema.text('References'))
      let h1 = schema.nodes.heading.create({ tagName: 'h1' }, refTitle)
      let allRefsContainer = schema.nodes.reference_container.create({ contenteditableNode: 'false' }, refContainerNode)
      let tr = state.tr.replaceWith(nodeStart, nodeEnd, [h1, allRefsContainer])
      view.dispatch(tr.setMeta('addToLastHistoryGroup', true))
    } else {
      let tr = state.tr.replaceWith(nodeStart, nodeEnd, refContainerNode)
      view.dispatch(tr.setMeta('addToLastHistoryGroup', true))
    }
  }

  checkTextAndReplace(text: string, char: string) {
    let result: any
    if (/[0-9]{4}\)/gm.test(text)) {
      let regResult = /[0-9]{4}\)/.exec(text)![0];
      result = text.replace(regResult, regResult.split(')')[0] + char + ')')
    } else if (/[0 - 9]{ 4 }/gm.test(text)) {
      let regResult = /[0 - 9]{ 4 }/.exec(text)![0];
      result = text.replace(regResult, regResult + char)
    } else if (/\([0-9]{4}\)/gm.test(text)) {
      let regResult = /\([0-9]{4}\)/.exec(text)![0];
      result = text.replace(regResult, regResult.split(')')[0] + char + ')')
    } else {
      result = char + '. ' + text;
    }
    return result
  }
}
