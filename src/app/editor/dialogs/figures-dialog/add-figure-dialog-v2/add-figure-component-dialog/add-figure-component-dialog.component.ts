import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { editorContainer } from '@app/editor/services/prosemirror-editors.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { PMDomParser, schema } from '@app/editor/utils/Schema';

@Component({
  selector: 'app-add-figure-component-dialog',
  templateUrl: './add-figure-component-dialog.component.html',
  styleUrls: ['./add-figure-component-dialog.component.scss']
})
export class AddFigureComponentDialogComponent implements OnInit,AfterViewInit,AfterViewChecked {

  typeFromControl = new FormControl('',[Validators.required])
  urlFormControl = new FormControl('',[/* Validators.pattern(`[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)`), */Validators.required]);
  types = ['video','image'];

  @ViewChild('componentDescription', { read: ElementRef }) componentDescription?: ElementRef;
  componentDescriptionPmContainer:editorContainer

  constructor(
    private serviceShare:ServiceShare,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddFigureComponentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { component?:{
      "description": string,
      "componentType": string,
      "url": string
    }, }
  ) { }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges()
  }

  ngOnInit(): void {
  }

  setComponentDataIfAny(){
    if(this.data&&this.data.component){
      this.urlFormControl.setValue(this.data.component.url)
      this.typeFromControl.setValue(this.data.component.componentType)

      let descContainer = document.createElement('div');
      descContainer.innerHTML = this.data.component.description;
      let prosemirrorNode = PMDomParser.parse(descContainer);
      console.log(prosemirrorNode);
      let descPmView = this.componentDescriptionPmContainer.editorView;
      let state = descPmView.state;
      descPmView.dispatch(state.tr.replaceWith(0, state.doc.content.size, prosemirrorNode.content));
    }
  }

  ngAfterViewInit(){
    let header = this.componentDescription?.nativeElement
    this.componentDescriptionPmContainer = this.serviceShare.ProsemirrorEditorsService.renderSeparatedEditorWithNoSync(header, 'pm-pdf-menu-container', schema.nodes.paragraph.create({},schema.text('Type component description here.')))
    this.setComponentDataIfAny()
  }

  closeDialog(){
    this.dialogRef.close()
  }

  submitDialog(){
    let newComponent = {
      "description": this.componentDescriptionPmContainer.editorView.dom.innerHTML,
      "componentType": this.typeFromControl.value,
      "url": this.urlFormControl.value
    }
    this.dialogRef.close({component:newComponent})
  }
}
