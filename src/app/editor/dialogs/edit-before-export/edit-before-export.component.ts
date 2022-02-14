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
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

let pageSizeDimensions = { // in milimeters
  'A0': { width: 841, height: 1188 },
  'A1': { width: 594, height: 841 },
  'A2': { width: 420, height: 594 },
  'A3': { width: 297, height: 420 },
  'A4': { width: 210, height: 297 },
  'A5': { width: 148, height: 210 },
}

function mmToPx(mm: number) {
  return mm * 3.7795275591;
}

function pxToPt(px: number) {
  return px * 0.75;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number,f?:number) {
  if(r==0&&g==0&&b==0){
    return undefined
  }
  let val = "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  return val
}

@Component({
  selector: 'app-edit-before-export',
  templateUrl: './edit-before-export.component.html',
  styleUrls: ['./edit-before-export.component.scss']
})
export class EditBeforeExportComponent implements AfterViewInit {

  elementOuterHtml?: string[]
  elements: Element[] = []
  sectionsContainers: string[][] = []
  importantLeafNodes: string[] = [
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

  @ViewChild('elementsContainer', { read: ElementRef }) elementsContainer?: ElementRef;

  pageSize: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' = 'A4';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { selected: 'pdf' | 'rtf' | 'msWord' | 'jatsXml' },
    private changeDetectorRef: ChangeDetectorRef,
    private http: HttpClient,
  ) { }

  ngAfterViewInit(): void {
    let articleElement = document.getElementById('app-article-element') as HTMLElement;
    let prosemirrorEditors = articleElement.getElementsByClassName('ProseMirror-example-setup-style');

    this.elementOuterHtml = []



    let loopChildrenRecursivly = (element: Element, sectionContainer: string[]) => {
      Array.from(element.children).forEach((elChild) => {
        if (this.importantLeafNodes.includes(elChild.tagName.toLocaleLowerCase())) {
          //sectionContainer.push(elChild.outerHTML)
          let contaienrDiv = document.createElement('div');
          contaienrDiv.innerHTML = elChild.outerHTML
          this.elements.push(contaienrDiv.firstChild as Element);
        } else {
          loopChildrenRecursivly(elChild, sectionContainer)
        }
      })
    }

    Array.from(prosemirrorEditors).forEach((pmEdEl: Element) => {
      pmEdEl.children.length
      let sectionHtmlElementsContainer: string[] = []
      loopChildrenRecursivly(pmEdEl, sectionHtmlElementsContainer)
      this.sectionsContainers!.push(sectionHtmlElementsContainer);
    })

    this.changeDetectorRef.detectChanges()
    this.refreshContent()


  }

  /* createPdfBinary(docDefinition:any) {
    var pdf = pdfmake.createPdf(docDefinition);
    return pdf.getDataUrl();
  } */

  bindHTML(div: HTMLDivElement, html: string) {
    div.innerHTML = html
  }

  refreshContent() {
    let pagePadding = 10;

    let elementsContainerElements = (this.elementsContainer?.nativeElement as Element)

    elementsContainerElements.append(...this.elements)

    let fullHeight = elementsContainerElements.clientHeight;
    let pageHeight = mmToPx(pageSizeDimensions[this.pageSize].height) - 2 * pagePadding;
    let pageWidth = mmToPx(pageSizeDimensions[this.pageSize].width) - 2 * pagePadding;
    let numberOfHorizontalLines = Math.floor(fullHeight / pageHeight);

    let elementsContainer = document.getElementById('pm-elements-container') as HTMLDivElement;
    elementsContainer.style.width = pageWidth + "px";
    elementsContainer.style.backgroundColor = 'white';
    elementsContainer.style.padding = pagePadding + 'px';

    let previewContainer = document.getElementsByClassName('preview-container')[0] as HTMLDivElement;
    previewContainer.style.backgroundColor = 'gray';

    elementsContainer.style.margin = '10px auto'
    /* elementsContainer.style.marginRight = '10px';
    elementsContainer.style.marginTop = '10px';
    elementsContainer.style.marginBottom = '10px';
    elementsContainer.style.marginLeft = '10px'; */

    let hrLinesContainer = (document.getElementById('hr-lines') as HTMLDivElement);
    hrLinesContainer.style.width = pageWidth + 'px';
    hrLinesContainer.innerHTML = ''
    hrLinesContainer.style.margin = '10px auto';
    for (let i = 0; i < numberOfHorizontalLines; i++) {
      let hr = document.createElement('div');
      hr.className = 'horizontal-line';
      hr.style.height = '0';
      hr.style.display = 'block';
      hr.style.position = 'absolute';
      hr.style.borderBottom = '3px dashed #9b41ff'
      hr.style.transform = `translate(0, ${(i + 1) * mmToPx(pageSizeDimensions[this.pageSize].height) + pagePadding}px)`
      hr.style.width = '100%'
      hrLinesContainer.appendChild(hr);

    }
    //pdfmake()
    data.pageMargins = [pagePadding, pagePadding, pagePadding, pagePadding];

    let newPdfData: any = { content: [], styles: {}, images: [], defaultStyle: {} }
    newPdfData.pageMargins = [pagePadding, pagePadding, pagePadding, pagePadding];

    let generatePDFData = (element: Element, parentPDFel?: any,parentStyle?:any) => {
      let defaultView = (element.ownerDocument || document).defaultView

      let tag = element.tagName.toLocaleLowerCase()
      if (
        tag == 'p' ||
        tag == 'h1' ||
        tag == 'h2' ||
        tag == 'h3' ||
        tag == 'h4' ||
        tag == 'h5' ||
        tag == 'h6' ||
        tag == 'span' ||
        tag == 'strong' ||
        tag == 'ul' ||
        tag == 'sub' ||
        tag == 'sup' ||
        tag == 'citation' ||
        tag == 'u' ||
        tag == 'em' ||
        tag == 'form-field'
      ) {
        let newEl: any = {}
        let textStyles = this.getTextStyles(defaultView!.getComputedStyle(element, null), element as HTMLElement);
        if(parentStyle){
          Object.keys(parentStyle).forEach((key)=>{
            if(!textStyles[key]&&key !== 'text' && key!=='stack'){
              textStyles[key] = parentStyle[key];
            }
          })
        }
        if (element.childNodes.length == 1 && element.childNodes[0] instanceof Text) {
          newEl.text = element.childNodes[0].textContent;
          Object.assign(newEl, textStyles)
        } else if (element.childNodes.length > 1 &&
          (
            tag == 'h1' ||
            tag == 'h2' ||
            tag == 'h3' ||
            tag == 'h4' ||
            tag == 'h5' ||
            tag == 'h6' ||
            tag == 'form-field'
          )) {

          element.childNodes.forEach((node) => {
            let n: any
            if (node instanceof Text) {
              n = node.textContent
            } else if (node instanceof Element) {
              n = generatePDFData(node, newEl,textStyles)
            }
            if (!newEl.stack) {
              newEl.stack = [];
            }
            newEl.stack.push(n);
            Object.assign(newEl, textStyles)
          })
        }else{
          element.childNodes.forEach((node) => {
            let n: any
            if (node instanceof Text) {
              n = node.textContent
            } else if (node instanceof Element) {
              n = generatePDFData(node, newEl,textStyles)
            }
            if (!newEl.text) {
              newEl.text = [];
            }
            newEl.text.push(n);
            Object.assign(newEl, textStyles)
          })
        }
        return newEl
      }

    }

    let cont: any = []
    Array.from((this.elementsContainer?.nativeElement as HTMLDivElement).children).forEach((el) => {
      let pdfElement = generatePDFData(el);
      cont.push(pdfElement);


      // colums
      /*  width: '20%', */
    })

    data.content = cont
    pdfMake.createPdf(data).getDataUrl((data: any) => {
      (document.getElementById('pdfV') as HTMLIFrameElement).src = data;
    });
  }

  getTextStyles(elementStyles: any, element: HTMLElement) {
    function getLineHeight(el: HTMLElement) {
      var temp = document.createElement(el.nodeName), ret;
      temp.setAttribute("style", "margin:0; padding:0; "
        + "font-family:" + (el.style.fontFamily || "inherit") + "; "
        + "font-size:" + (el.style.fontSize || "inherit"));
      temp.innerHTML = "A";

      el.parentNode!.appendChild(temp);
      ret = temp.clientHeight;
      temp.parentNode!.removeChild(temp);

      return ret;
    }
    // text styling
    /*
    font: string: name of the font
    fontSize: number: size of the font in pt
    fontFeatures: string[]: array of advanced typographic features supported in TTF fonts (supported features depend on font file)
    lineHeight: number: the line height (default: 1)
    bold: boolean: whether to use bold text (default: false)
    italics: boolean: whether to use italic text (default: false)
    alignment: string: (‘left’ or ‘center’ or ‘right’ or ‘justify’) the alignment of the text
    characterSpacing: number: size of the letter spacing in pt
    color: string: the color of the text (color name e.g., ‘blue’ or hexadecimal color e.g., ‘#ff5500’)
    background: string the background color of the text
    markerColor: string: the color of the bullets in a buletted list
    decoration: string: the text decoration to apply (‘underline’ or ‘lineThrough’ or ‘overline’)
    decorationStyle: string: the style of the text decoration (‘dashed’ or ‘dotted’ or ‘double’ or ‘wavy’)
    decorationColor: string: the color of the text decoration, see color */
    var style = elementStyles.getPropertyValue('font-size');
    var align = elementStyles.getPropertyValue('text-aling');
    var fontSize = parseFloat(style);
    // now you have a proper float for the font size (yes, it can be a float, not just an integer)

    (element as HTMLElement).style.textAlign
    //@ts-ignore
    //@ts-ignore
    let textStyles: any = {
      fontSize: pxToPt(fontSize),
      //lineHeight: pxToPt(getLineHeight(element)),
      bold:
        elementStyles.font.split(' ')[0] >= 500 ||
        element.tagName == 'STRONG' ||
        element.tagName == 'H1' ||
        element.tagName == 'H2' ||
        element.tagName == 'H3' ||
        element.tagName == 'H4' ||
        element.tagName == 'H5' ||
        element.tagName == 'H6',
      italics: element.tagName == 'EM',
      alignment: element.style.textAlign,
      //@ts-ignore
      color: (elementStyles.color&&elementStyles.color.trim()!=="") ? rgbToHex(...elementStyles.color.replace('rgb', '').replace('(', '').replace(')', '').replace('a', '').split(', ').map((el) => +el)) : undefined,
      //@ts-ignore
      background: (elementStyles.backgroundColor&&elementStyles.backgroundColor.trim()!=="") ? rgbToHex(...elementStyles.backgroundColor.replace('rgb', '').replace('a', '').replace('(', '').replace(')', '').split(', ').map((el) => +el)) : undefined,
      decoration: elementStyles.textDecorationLine == 'line-through'?'lineThrough':element.tagName=='U'?'underline':elementStyles.textDecorationLine == 'overline'?'overline':undefined,
      decorationStyle: elementStyles.textDecorationStyle!=='solid'?elementStyles.textDecorationStyle:undefined,
      //@ts-ignore
      decorationColor:(elementStyles.textDecorationColor&& elementStyles.textDecorationColor.trim()!=='' )? rgbToHex(...elementStyles.textDecorationColor.replace('rgb', '').replace('a', '').replace('(', '').replace(')', '').split(', ').map((el) => +el)) : undefined,
    }


    let clearedStyles: any = {}

    Object.keys(textStyles).forEach((key) => {
      let val = textStyles[key]
      if (val && `${val}`.trim() !== '') {
        clearedStyles[key] = val
      }
    })
    if (elementStyles.textAlign == 'left' || elementStyles.textAlign == 'right' || elementStyles.textAlign == 'center') {
      clearedStyles.alignment = elementStyles.textAlign;
    }
    return clearedStyles
  }

  elementToPdfMakeJson(pdfdata: any, element: Element) {
  }

  drop(event: CdkDragDrop<string[]>, sectionIndex: number) {
    moveItemInArray(this.sectionsContainers[sectionIndex], event.previousIndex, event.currentIndex);

  }
}
