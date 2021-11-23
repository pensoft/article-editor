import { AfterViewInit, Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { XmlFragment } from 'yjs';
import { YMap } from 'yjs/dist/src/internals';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { articleSection, editorData } from '../utils/interfaces/articleSection';
import { schema } from '../utils/Schema';
import { Node as prosemirrorNode } from 'prosemirror-model';



@Component({
  selector: 'app-prosemirror-editor',
  templateUrl: './prosemirror-editor.component.html',
  styleUrls: ['./prosemirror-editor.component.scss']
})
export class ProsemirrorEditorComponent implements AfterViewInit {

  @ViewChild('editor', { read: ElementRef }) focusElement?: ElementRef;
  @ViewChild('editor', { read: ElementRef }) editor?: ElementRef;
  @Input('data') data?: { contentData: editorData, sectionData: articleSection }

  mode: 'editor' | 'editorHtmlCopy' | 'xmlcopy' | 'editorSectionBuilder' = 'editor'
  xmlFragment?: XmlFragment
  editingRN = false
  editorView?: EditorView
  editorContainer?: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  }

  constructor(private prosemirrorService: ProsemirrorEditorsService, private renderer: Renderer2,
    private ydocService: YdocService,  private detectFocusService: DetectFocusService) {
    this.renderer.listen('window', 'click', (e: Event) => {
      try {
        if(this.mode == 'editor'){
          return
        }
        if (this.editingRN) {
          if (!this.editorContainer!.editorView.hasFocus()) {
            this.editingRN = false;
            this.showXmlFragment()
          }
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  clickEditor() {
    this.editingRN = true;

  }

  ngAfterViewInit(): void {
    this.detectFocusService.focusedEditor.subscribe((editor) => {
    })
    let awaitValue = () => {
      setTimeout(() => {
        if (this.data) {
          renderEditor()
        } else {
          awaitValue()
        }
      }, 100);
    }
    let renderEditor = () => {
      try {
        if (this.mode == 'editor') {
          this.editorContainer = this.prosemirrorService.renderEditorInWithId(this.editor?.nativeElement, this.data?.sectionData!.sectionID!, this.data?.sectionData!)

        } else if (this.mode == 'editorSectionBuilder'){

        }else if (this.mode == 'editorHtmlCopy') {
          this.editorContainer = this.prosemirrorService.renderEditorInWithId(this.editor?.nativeElement, this.data?.sectionData!.sectionID!, this.data?.sectionData!)
          this.editorView = this.editorContainer.editorView
          setTimeout(() => {
            (this.editor?.nativeElement).innerHTML = this.editorContainer!.containerDiv.innerHTML
          }, 10)
          this.showXmlFragment();
        } else if (this.mode == 'xmlcopy') {
          this.xmlFragment = this.prosemirrorService.getXmlFragment(this.data?.sectionData!.mode!,this.data?.contentData!.editorId!)

          //this.xmlFragment = this.data?.sectionData!.mode == 'editMode' ? this.ydocCopyService.ydoc?.getXmlFragment(this.data?.contentData!.editorId) : this.ydocService.ydoc?.getXmlFragment(this.data?.contentData!.editorId)
          this.showXmlFragment();
        }
      } catch (e) {
        console.error(e);
      }
    }
    awaitValue()
  }
  observeF = () => {

    if (this.mode == 'editorHtmlCopy') {
      if (this.editingRN) {
        return
      }
      (this.editor?.nativeElement).innerHTML = this.editorContainer!.containerDiv.innerHTML;
    }else if (this.mode == 'xmlcopy') {
      (this.editor?.nativeElement).innerHTML = this.xmlFragment?.toDOM()?.textContent!
    }
  }
  showXmlFragment() {

    if (this.mode == 'editor') {
      return;
    }  else if (this.mode == 'editorSectionBuilder'){
    }else if (this.mode == 'editorHtmlCopy') {
      if (this.editingRN) {
        return
      }
      this.xmlFragment?.observeDeep(this.observeF);
      (this.editor?.nativeElement).innerHTML = this.editorContainer!.containerDiv.innerHTML;
      //console.log((this.editor?.nativeElement as HTMLDivElement).children.item(0)!);
      //(this.editor?.nativeElement as HTMLDivElement).replaceChild((this.editor?.nativeElement as HTMLDivElement).children.item(0)!,this.editorContainer!.containerDiv.cloneNode());
    } else if (this.mode == 'xmlcopy') {
      if (this.editingRN) {
        return
      }
      let label = this.data?.contentData!.editorMeta?.label ? `<div>${this.data?.contentData!.editorMeta?.label}</div>` : '';
      let editorContent = '<div  style="margin-top: 9px;margin-bottom: 1em;    word-break: break-all;line-height: 1.2;">' + this.xmlFragment?.toDOM()?.textContent! + '</div>';

      let placeHolder = ''
      if (this.xmlFragment?.toDOM()?.textContent! == '') {
        placeHolder = `<div style="color:#878787;margin-top: 9px;margin-bottom: 1em;    word-break: break-all;">${this.data?.contentData!.editorMeta?.placeHolder || 'Type here...'}</div>`
      }
      (this.editor?.nativeElement).innerHTML = label + placeHolder + editorContent; 
      this.prosemirrorService.deleteEditor(this.data?.contentData!.editorId)
      this.xmlFragment?.observeDeep(this.observeF)
    }
  }
  showEditor() {
    try {
      if (this.mode == 'editor') {
        return;
      }  else if (this.mode == 'editorSectionBuilder'){
      }else if (this.mode == 'editorHtmlCopy' || this.mode == 'xmlcopy') {
        if (this.editingRN) {
          return
        }
        (this.editor?.nativeElement).innerHTML = ''
        this.editorContainer = this.prosemirrorService.renderEditorInWithId(this.editor?.nativeElement, this.data?.sectionData!.sectionID!, this.data?.sectionData!)
        this.editorView = this.editorContainer.editorView;
        this.xmlFragment?.unobserveDeep(this.observeF)
      }
    } catch (e) {
      console.error(e);
    }
  }
}
