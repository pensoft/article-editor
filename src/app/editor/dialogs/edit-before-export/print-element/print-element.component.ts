import { C } from '@angular/cdk/keycodes';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-print-element',
  templateUrl: './print-element.component.html',
  styleUrls: ['./print-element.component.scss']
})
export class PrintElementComponent implements AfterViewInit {

  @Input() elementHTML!: any;
  @Output() elementHTMLChange = new EventEmitter<any>();
  @ViewChild('printElement', { read: ElementRef }) printElement?: ElementRef;
  @ViewChild(MatMenuTrigger, {static: true}) matMenuTrigger?: MatMenuTrigger;

  @Input() refreshContent?: any;
  @Output() refreshContentChange = new EventEmitter<any>();

  @Input() end?: boolean;
  constructor(private changeDetectorRef: ChangeDetectorRef,) { }

  hasPageBreakBefore : boolean = false
  hasPageBreakAfter : boolean = false

  async ngAfterViewInit() {
    if(this.end){
      setTimeout(async()=>{
        await this.refreshContent()
      },1000)
    }
    let html = this.elementHTML
    let result = /<iframe[^>]+><\/iframe>/gm.exec(html)
    if(result){
      let iframe = result[0];
      let srcresult = /src="([^"]+)"/gm.exec(iframe)
      if(srcresult){
        let scr = srcresult[1];
        let videoId = /https:\/\/www\.youtube\.com\/embed\/([\S]+)/.exec(scr)![1];
        if(videoId){
          let imgId = 'https://img.youtube.com/vi/'+videoId+'/sddefault.jpg'
          html = html.replace(iframe,'<img src="'+ imgId+ '" width="300"/>')
        }
      }
      //html = html.replace()
    }
    let dom = new DOMParser().parseFromString(html, 'text/html');
    (this.printElement?.nativeElement as HTMLElement).removeChild((this.printElement?.nativeElement as HTMLElement).firstChild!);
    this.printElement?.nativeElement.append(dom.getElementsByTagName('body')[0].firstChild)
    //@ts-ignore
    //this.printElement?.nativeElement.innerHTML = this.elementHTML
    let el = this.printElement?.nativeElement.firstChild! as HTMLElement
    let pbbefore = el.getAttribute('page-break-before')
    let pbbafter = el.getAttribute('page-break-after')
    this.hasPageBreakBefore = pbbefore?pbbefore == 'true'?true:false:false;
    this.hasPageBreakAfter = pbbafter?pbbafter == 'true'?true:false:false;
    this.changeDetectorRef.detectChanges();
  }

  menuTopLeftPosition =  {x: '0', y: '0'};

  // reference to the MatMenuTrigger in the DOM

  /**
   * Method called when the user click with the right button
   * @param event MouseEvent, it contains the coordinates
   * @param item Our data contained in the row of the table
   */
  onRightClick(event: MouseEvent, item:HTMLDivElement) {
      // preventDefault avoids to show the visualization of the right-click menu of the browser
      event.preventDefault();

      // we record the mouse position in our object
      this.menuTopLeftPosition.x = event.clientX + 'px';
      this.menuTopLeftPosition.y = event.clientY + 'px';

      // we open the menu
      // we pass to the menu the information about our object

      // we open the menu
      this.matMenuTrigger!.openMenu();
  }

  addPageBreakBeforeItem(item:HTMLDivElement){
    let element = item.firstChild! as HTMLElement;
    if(this.hasPageBreakBefore){
      element.setAttribute('page-break-before','false')
      this.hasPageBreakBefore = false;
    }else{
      element.setAttribute('page-break-before','true')
      this.hasPageBreakBefore = true;
    }
  }

  addPageBreakAfterItem(item:HTMLDivElement){
    let element = item.firstChild! as HTMLElement;
    if(this.hasPageBreakAfter){
      element.setAttribute('page-break-before','false')
      this.hasPageBreakAfter = false;
    }else{
      element.setAttribute('page-break-before','true')
      this.hasPageBreakAfter = true;
    }
  }

}
