import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';
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
  rowOrder :number[] = [];
  figureRows:any[][] = []
  itemsOnRowSelect:FormControl = new FormControl(1);
  rowTemplate:any[] = []
  maxImgHeightPers?:number;
  maxImgWidthPers?:number;
  bottomOffset = 0.30; // offset the figures images from the bottom of the list in preview- figure description space
  // offset is in persentage
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

  updatePreview(checkDiff:boolean){
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
    let a4Pixels = [595 , 842-(842*this.bottomOffset)];
    if(differrance||!checkDiff){
      if(!hasEmptyFields){
        this.figureComponents = JSON.parse(JSON.stringify(this.instance.data.figureComponents));
        this.rowOrder = [];
        this.figureComponents.forEach((figure:any,index:number)=>{

          if(index<4){
            this.rowOrder.push(index+1);
          }
        })
        let rows = this.figureComponents.length/this.itemsOnRowSelect.value
        if(rows%1){
          rows = Math.floor((this.figureComponents.length/this.itemsOnRowSelect.value)+1)
        }
        let r = 0;
        let i = 0;
        let iInR = 0;
        this.figureRows = []
        while (i<this.figureComponents.length&&r<rows) {
          if(!this.figureRows[r]){
            this.figureRows[r] = [];
          }
          this.figureRows[r].push(this.figureComponents[i]);
          i++;
          iInR++;
          if(iInR == this.itemsOnRowSelect.value){
            iInR = 0;
            r++;
          }
        }
        this.rowTemplate = []
        for(let i = 0 ; i < this.itemsOnRowSelect.value;i++){
          this.rowTemplate.push(i);
        }
        let rowsN = rows;
        let collsN = this.itemsOnRowSelect.value;

        let maxImgHeight = a4Pixels[1]/rowsN;
        let maxImgWidth = a4Pixels[0]/collsN;

        this.maxImgHeightPers = maxImgHeight*100/a4Pixels[1];
        this.maxImgWidthPers = maxImgWidth*100/a4Pixels[0];

        let calcImgPersentageFromFullA4 = (img:HTMLImageElement,maxImgHeight:number,maxImgWidth:number,a4PixelRec:number[],figComp:any) => {
          if(img.naturalHeight<maxImgHeight&&img.naturalWidth<maxImgWidth){
            let heightPersent = img.naturalHeight/a4PixelRec[1];
            let widthPersent = img.naturalWidth/a4PixelRec[0];
            figComp.container.hpers = heightPersent
            figComp.container.wpers = widthPersent
          }else if(img.naturalHeight/maxImgHeight > img.naturalWidth/maxImgWidth){
            figComp.container.height = maxImgHeight/a4PixelRec[1];
          }else if(img.naturalHeight/maxImgHeight < img.naturalWidth/maxImgWidth){
            figComp.container.width = maxImgWidth/a4PixelRec[0];
          }else if(img.naturalHeight/maxImgHeight == img.naturalWidth/maxImgWidth){
            figComp.container.height = maxImgHeight/a4PixelRec[1];
            figComp.container.width = maxImgWidth/a4PixelRec[0];
          }
        }
        for(let i = 0;i<this.figureRows.length;i++){
          for(let j = 0;j<this.figureRows[i].length;j++){
            let image = this.figureRows[i][j];
            let newImg = new Image();
            newImg.addEventListener('load',()=>{
              calcImgPersentageFromFullA4(newImg,maxImgHeight,maxImgWidth,a4Pixels,image);
            })
            newImg.src = image.container.url;
          }
        }
        this.formioEventsService.events.next({event:'save-data-for-submit',data:{
          a4Pixels,
          figRows:this.figureRows,
          nOfRows:rowsN,
          nOfColumns:collsN,
          maxImgHeightPers:this.maxImgHeightPers,
          maxImgWidthPers:this.maxImgWidthPers,
        }})
        this.displayComponents = true;
      }
    }
  }

  ngAfterViewInit(): void {

    this.itemsOnRowSelect.valueChanges.subscribe((change)=>{
      this.updatePreview(false)
    })
    this.formioEventsService.events.subscribe((data)=>{
      if(data.event == 'data-grid-drag-drop'){
        this.updatePreview(true)
      }
    })

    this.instance.parent.on('change', () => {
      this.updatePreview(true)
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
