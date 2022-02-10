import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { data } from './exampleData';
//@ts-ignore
//import * as pdfMake from 'pdfmake'
//@ts-ignore
import pdfMake from "pdfmake/build/pdfmake";
//@ts-ignore
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;

let pageSizeDimensions = { // in milimeters
  'A0': { width: 841, height: 1188 },
  'A1': { width: 594, height: 841 },
  'A2': { width: 420, height: 594 },
  'A3': { width: 297, height: 420 },
  'A4': { width: 210, height: 297 },
  'A5': { width: 148, height: 210 },
}

function mmToPx(mm:number){
  return mm*3.7795275591;
}

function pxToPt(px:number){
  return px*0.75;
}

@Component({
  selector: 'app-edit-before-export',
  templateUrl: './edit-before-export.component.html',
  styleUrls: ['./edit-before-export.component.scss']
})
export class EditBeforeExportComponent implements AfterViewInit {

  elementOuterHtml?: string[]
  elements: Element[] = []
  @ViewChild('elementsContainer', { read: ElementRef }) elementsContainer?: ElementRef;

  pageSize: 'A0'| 'A1'| 'A2'| 'A3'| 'A4'| 'A5' = 'A4';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { selected: 'pdf' | 'rtf' | 'msWord' | 'jatsXml' },
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
  ) { }

  ngAfterViewInit(): void {
    let articleElement = document.getElementById('app-article-element') as HTMLElement;
    let prosemirrorEditors = articleElement.getElementsByClassName('ProseMirror-example-setup-style');
    console.log(this.data.selected, prosemirrorEditors);

    this.elementOuterHtml = []

    let importantLeafNodes: string[] = [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p',
      'table',
      'blockquote',
      'hr',
      'pre',
      'br',
      'spacer',
      'img',
      'figures-nodes-container',
      'ol',
      'ul',
      'math - display',
    ];

    let loopChildrenRecursivly = (element: Element) => {
      Array.from(element.children).forEach((elChild) => {
        console.log();
        if (importantLeafNodes.includes(elChild.tagName.toLocaleLowerCase())) {
          console.log(elChild.tagName);
          this.elementOuterHtml!.push(elChild.outerHTML);
        } else {
          loopChildrenRecursivly(elChild)
        }
      })
    }

    Array.from(prosemirrorEditors).forEach((pmEdEl: Element) => {
      loopChildrenRecursivly(pmEdEl)
    })

    this.elementOuterHtml.forEach((html) => {
      let el = document.createElement('div');
      el.innerHTML = html;
      if (el.firstChild) {
        this.elements.push(el.firstChild as Element);
      }
    });

    let pagePadding = 10;

    let elementsContainerElements = (this.elementsContainer?.nativeElement as Element)
    elementsContainerElements.innerHTML = '';
    elementsContainerElements.append(...this.elements);

    let fullHeight = elementsContainerElements.clientHeight;
    let pageHeight = mmToPx(pageSizeDimensions[this.pageSize].height) - 2*pagePadding;
    console.log(fullHeight,fullHeight/pageHeight);
    let numberOfHorizontalLines = Math.floor(fullHeight/pageHeight);

    let elementsContainer = document.getElementsByClassName('elements-container')[0] as HTMLDivElement;
    elementsContainer.style.width = (mmToPx(pageSizeDimensions[this.pageSize].width) - 2*pagePadding)+"px";
    elementsContainer.style.backgroundColor = 'white';
    elementsContainer.style.padding = pagePadding+ 'px';

    let previewContainer = document.getElementsByClassName('preview-container')[0] as HTMLDivElement;
    previewContainer.style.backgroundColor = 'gray';


    elementsContainer.style.marginRight = '10px';
    elementsContainer.style.marginTop = '10px';
    elementsContainer.style.marginBottom = '10px';
    elementsContainer.style.marginLeft = '10px';

    let hrLinesContainer = (document.getElementById('hr-lines') as HTMLDivElement);
    hrLinesContainer.innerHTML = ''
    for(let i = 0;i<numberOfHorizontalLines;i++){
      let hr = document.createElement('div');
      hr.className = 'horizontal-line';
      hr.style.height = '0';
      hr.style.display = 'block';
      hr.style.position = 'absolute';
      hr.style.borderBottom = '3px dashed black'
      hr.style.transform = `translate(0, ${(i+1)*mmToPx(pageSizeDimensions[this.pageSize].height)}px)`
      hr.style.width = '100%'
      hrLinesContainer.appendChild(hr);

    }
    //pdfmake()
    data.pageMargins = [pagePadding,pagePadding,pagePadding,pagePadding];
    pdfMake.createPdf(data).getDataUrl((data: any) => {
      (document.getElementById('pdfV') as HTMLIFrameElement).src = data;
    });


  }

  /* createPdfBinary(docDefinition:any) {
    var pdf = pdfmake.createPdf(docDefinition);
    return pdf.getDataUrl();
  } */

  bindHTML(div: HTMLDivElement, html: string) {
    div.innerHTML = html
  }

  refreshContent() {
    let newPdfData = { content: [], styles: {}, images: [], defaultStyle: {} }
    pdfMake.createPdf(data).getDataUrl((data: any) => {
      (document.getElementById('pdfV') as HTMLIFrameElement).src = data;
    });
  }

  elementToPdfMakeJson(pdfdata:any,element:Element){

  }
}
