import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormioCustomComponent } from '@formio/angular';
import { uuidv4 } from 'lib0/random';
import { MaterialComponent } from 'src/app/formio-angular-material/components/MaterialComponent';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { YdocService } from '../../services/ydoc.service';
import { taxa, taxonomicCoverageContentData } from '../../utils/interfaces/articleSection';

@Component({
  selector: 'app-taxonomic-coverage',
  templateUrl: './taxonomic-coverage.component.html',
  styleUrls: ['./taxonomic-coverage.component.scss']
})
export class TaxonomicCoverageComponent extends MaterialComponent implements AfterViewInit {
  newValue:any
  value: any;

  renderTaxonomy = false;
  taxonomicData ?:taxonomicCoverageContentData
  constructor(
    private prosemirrorService:ProsemirrorEditorsService,
    private ydocService:YdocService,
    public element: ElementRef, 
    public ref: ChangeDetectorRef) { 
      super(element,ref)
  }

  drop(event: any) {
    moveItemInArray(this.taxonomicData?.taxaArray!, event.previousIndex, event.currentIndex);
  }
  
  ngAfterViewInit(): void {
    let awaitValue = ()=>{
      setTimeout(() => {
        if(this.value!==undefined){
          renderEditor()
        }else{
          awaitValue()
        }
      }, 100);
    }
    this.value = this.control.value
    awaitValue()
    let renderEditor = ()=>{
      this.taxonomicData = this.value.contentData
      try{
        if(this.value.contentData.mode!=="documentMode"){
          this.render()
        }else{
          this.render()
          //this.prosemirrorService.renderEditorIn(this.editor?.nativeElement,this.value.contentData)
        }
      }catch(e){
        console.error(e);
      }
    }
  }

  render(){
    this.renderTaxonomy = true;
  }
}
