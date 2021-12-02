import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MaterialComponent } from 'src/app/formio-angular-material/angular-material-formio.module';
import { SafePipe } from 'src/app/formio-angular-material/components/MaterialComponent';
import { FormioEventsService } from '../formio-events.service';

@Component({
  selector: 'app-figure-preview',
  templateUrl: './figure-preview.component.html',
  styleUrls: ['./figure-preview.component.scss']
})
export class FigurePreviewComponent extends MaterialComponent implements AfterViewInit {

  figureComponents?: any
  displayComponents = false

  constructor(
    public element: ElementRef,
    private sanitizer: DomSanitizer,
    private formioEventsService:FormioEventsService,
    public ref: ChangeDetectorRef) {
      super(element, ref)
  }

  getHTMLContent(html:string){
    let temp = document.createElement('div');
    temp.innerHTML = html
    return temp.textContent
  }

  custumPipe(url: string) {
    let pipe = new SafePipe(this.sanitizer);
    return pipe.transform(url)
  }

  updatePreview(){
    let hasEmptyFields = false;
    let differrance = false;
    this.instance.data.figureComponents.forEach((comp: any, i: number) => {
      let { componentType, url, description } = comp.container;
      if (componentType == '' || url == '' || description == '') {
        hasEmptyFields = true;
      }
      if(!this.figureComponents){
        differrance = true 
      }
      else if (this.figureComponents[i]) {
        let { componentTypePrev, urlPrev, descriptionPrev } = this.figureComponents[i].container
        if(componentTypePrev!==componentType||urlPrev!==url||descriptionPrev!==description){
          differrance = true 
        }
      }else{
        differrance = true 
      }
      
    })
    if(differrance){
      if(!hasEmptyFields){
        this.figureComponents = JSON.parse(JSON.stringify(this.instance.data.figureComponents))
        
        this.displayComponents = true
      }
    }
  }

  ngAfterViewInit(): void {
    this.formioEventsService.events.subscribe((data)=>{
      if(data.event == 'data-grid-drag-drop'){
      this.updatePreview()
      }
    })
    
    this.instance.parent.on('change', () => {
      this.updatePreview()
    })
    if (this.element && this.element.nativeElement && this.instance) {
      // Add custom classes to elements.
      if (this.instance.component.customClass) {
        this.element.nativeElement.classList.add(this.instance.component.customClass);
      }
    }

    if (this.input) {
      // Set the input masks.
      this.instance.setInputMask(this.input.nativeElement);
      this.instance.addFocusBlurEvents(this.input.nativeElement);
    }
  }

}
