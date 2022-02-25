import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { data } from './exampleData';
//@ts-ignore
//import * as pdfMake from 'pdfmake'
//@ts-ignore
import pdfMake from "pdfmake/build/pdfmake.js";
//@ts-ignore
import vfs from "pdfmake/build/vfs_fonts.js";
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { E, N } from '@angular/cdk/keycodes';
import { table } from 'console';
import { YdocService } from '@app/editor/services/ydoc.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';

import html2canvas from 'html2canvas'
import { resolve } from 'dns';
import { reject } from 'lodash';
import { Subject } from 'rxjs';
import { leadingComment } from '@angular/compiler';
import { FormControl, Validators } from '@angular/forms';
import { getFontEmbedCSS, toBlob, toCanvas, toJpeg, toPixelData, toPng, toSvg } from 'html-to-image'
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
//@ts-ignore
import {imageDataURI} from 'image-data-uri'
pdfMake.vfs = vfs;

pdfMake.fonts = {
  Roboto: {
    normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
    bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
    italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
    bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf'
  },
}

let pageSizeDimensions = { // in milimeters
  'A0': { width: 841, height: 1188 },
  'A1': { width: 594, height: 841 },
  'A2': { width: 420, height: 594 },
  'A3': { width: 297, height: 420 },
  'A4': { width: 210, height: 297 },
  'A5': { width: 148, height: 210 },
}

var pageDimensionsInPT = {
  '4A0': [4767.87, 6740.79],
  '2A0': [3370.39, 4767.87],
  A0: [2383.94, 3370.39],
  A1: [1683.78, 2383.94],
  A2: [1190.55, 1683.78],
  A3: [841.89, 1190.55],
  A4: [595.28, 841.89],
  A5: [419.53, 595.28],
  A6: [297.64, 419.53],
  A7: [209.76, 297.64],
  A8: [147.40, 209.76],
  A9: [104.88, 147.40],
  A10: [73.70, 104.88],
  B0: [2834.65, 4008.19],
  B1: [2004.09, 2834.65],
  B2: [1417.32, 2004.09],
  B3: [1000.63, 1417.32],
  B4: [708.66, 1000.63],
  B5: [498.90, 708.66],
  B6: [354.33, 498.90],
  B7: [249.45, 354.33],
  B8: [175.75, 249.45],
  B9: [124.72, 175.75],
  B10: [87.87, 124.72],
  C0: [2599.37, 3676.54],
  C1: [1836.85, 2599.37],
  C2: [1298.27, 1836.85],
  C3: [918.43, 1298.27],
  C4: [649.13, 918.43],
  C5: [459.21, 649.13],
  C6: [323.15, 459.21],
  C7: [229.61, 323.15],
  C8: [161.57, 229.61],
  C9: [113.39, 161.57],
  C10: [79.37, 113.39],
  RA0: [2437.80, 3458.27],
  RA1: [1729.13, 2437.80],
  RA2: [1218.90, 1729.13],
  RA3: [864.57, 1218.90],
  RA4: [609.45, 864.57],
  SRA0: [2551.18, 3628.35],
  SRA1: [1814.17, 2551.18],
  SRA2: [1275.59, 1814.17],
  SRA3: [907.09, 1275.59],
  SRA4: [637.80, 907.09],
  EXECUTIVE: [521.86, 756.00],
  FOLIO: [612.00, 936.00],
  LEGAL: [612.00, 1008.00],
  LETTER: [612.00, 792.00],
  TABLOID: [792.00, 1224.00]
};

function mmToPx(mm: number) {
  return mm * 3.7795275591;
}

function pxToPt(px: number) {
  return px * 0.75;
}

function ptToPx(pt: number) {
  return pt / 0.75;
}

function componentToHex(c: number) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r: number, g: number, b: number, f?: number) {
  if (r == 0 && g == 0 && b == 0) {
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

  articleSectionsStructure?: articleSection[]
  articleSectionsStructureFlat?: articleSection[]
  importantLeafNodes: string[] = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p',
    'table',
    'blockquote',
    'pre',
    'br',
    'spacer',
    'img',
    'block-figure',
    'ol',
    'ul',
    'math-display',
  ];

  @ViewChild('elementsContainer', { read: ElementRef }) elementsContainer?: ElementRef;

  pageSize: 'A0' | 'A1' | 'A2' | 'A3' | 'A4' | 'A5' = 'A4';
  data: any
  readyRendering = new Subject<any>();
  pageMargin = [10, 10, 10, 10];

  marginTopControl = new FormControl(this.pageMargin[0])
  marginRightControl = new FormControl(this.pageMargin[1])
  marginBottomControl = new FormControl(this.pageMargin[2])
  marginLeftControl = new FormControl(this.pageMargin[3])

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: { selected: 'pdf' | 'rtf' | 'msWord' | 'jatsXml' },
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<EditBeforeExportComponent>,
    private http: HttpClient,
    private ydocService: YdocService,
  ) {
    this.data = data;
  }

  fillElementsArray() {
    this.elements = []
    let loopChildren = (element: HTMLElement) => {
      if (element instanceof HTMLElement && element.tagName) {
        let elTag = element.tagName.toLocaleLowerCase();
        if (this.importantLeafNodes.includes(elTag)) {
          this.elements.push(element)
        } else if (element.childNodes.length > 0) {
          element.childNodes.forEach((child) => {
            loopChildren(child as HTMLElement);
          })
        }
      }
    }
    loopChildren(this.elementsContainer?.nativeElement)
  }

  makeFlat() {
    let articleSectionsStructureFlat: any = []
    let makeFlat = (structure: articleSection[]) => {
      if (structure) {
        structure.forEach((section) => {
          if (section.active) {
            articleSectionsStructureFlat.push(section)
          }
          if (section.children.length > 0) {
            makeFlat(section.children)
          }
        })
      }

    }
    makeFlat(this.articleSectionsStructure!)
    this.articleSectionsStructureFlat = []
    this.articleSectionsStructureFlat = articleSectionsStructureFlat
    return articleSectionsStructureFlat
  }

  async ngAfterViewInit() {
    let articleElement = document.getElementById('app-article-element') as HTMLElement;
    let prosemirrorEditors = articleElement.getElementsByClassName('ProseMirror-example-setup-style');
    this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
    this.makeFlat()
    this.elementOuterHtml = []



    let loopChildrenRecursivly = (element: Element, sectionContainer: string[], section?: articleSection) => {
      Array.from(element.children).forEach((elChild) => {
        if (this.importantLeafNodes.includes(elChild.tagName.toLocaleLowerCase())) {
          let contaienrDiv = document.createElement('div');
          contaienrDiv.innerHTML = elChild.outerHTML
          if (section) {
            (contaienrDiv.firstChild as HTMLElement).setAttribute('section-name', section.title.name!);
          }
          sectionContainer.push(contaienrDiv.innerHTML)
          //this.elements.push(contaienrDiv.firstChild as HTMLElement);
        } else {
          loopChildrenRecursivly(elChild, sectionContainer, section)
        }
      })
    }

    Array.from(prosemirrorEditors).forEach((pmEdEl: Element, i) => {
      let sectionHtmlElementsContainer: string[] = []
      if (pmEdEl.children.length > 0) {
        loopChildrenRecursivly(pmEdEl, sectionHtmlElementsContainer, this.articleSectionsStructureFlat![i])
        this.sectionsContainers!.push(sectionHtmlElementsContainer);
      }
    })

    this.changeDetectorRef.detectChanges()
    //await this.refreshContent()
  }

  /* createPdfBinary(docDefinition:any) {
    var pdf = pdfmake.createPdf(docDefinition);
    return pdf.getDataUrl();
  } */
  async getDataUrl(img:HTMLImageElement){
    //@ts-ignore
    //dataURLString = imageDataURI.encodeFromURL(src)
    img.crossOrigin="anonymous"
    let canvas = document.createElement('canvas');

    await new Promise((resolve, reject) => {
      img.onload = ()=>{
        resolve('loaded')
      }
    })

    canvas.width = img.getBoundingClientRect().width;
    canvas.height = img.getBoundingClientRect().height;

    var ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, img.getBoundingClientRect().width, img.getBoundingClientRect().height)

    return Promise.resolve(canvas.toDataURL('image/jpeg'));
  }

  bindHTML(div: HTMLDivElement, html: string) {
    div.innerHTML = html
  }
  tablepadding = 6;

  closePdfPrintDialog() {
    this.dialogRef.close()
  }

  refreshContent = async () => {
    this.fillElementsArray()
    this.pageMargin = [
      +this.marginTopControl.value,
      +this.marginRightControl.value,
      +this.marginBottomControl.value,
      +this.marginLeftControl.value,
    ];

    let elementsContainerElements = (this.elementsContainer?.nativeElement as Element)

    //elementsContainerElements.append(...this.elements)

    let fullHeight = elementsContainerElements.clientHeight;
    let pageFullHeight = pageDimensionsInPT[this.pageSize][1] // in pt
    let pageFullWidth = pageDimensionsInPT[this.pageSize][0]  // in pt
    let pageHeight = ptToPx(pageFullHeight) - this.pageMargin[0] - this.pageMargin[2];
    let pageWidth = ptToPx(pageFullWidth) - this.pageMargin[1] - this.pageMargin[3];
    let numberOfHorizontalLines = Math.floor(fullHeight / pageHeight);

    let tablePadding = this.tablepadding;;
    let pageInPoints = pxToPt(pageWidth);
    let singleimgOnRowWidth = pageInPoints - tablePadding * 2;
    let twoImgOnRowWidth = (pageInPoints - tablePadding * 4) / 2;
    let threeImgOnRowWidth = (pageInPoints - tablePadding * 6) / 3;
    let fourImgOnRowWidth = (pageInPoints - tablePadding * 8) / 4;

    let elementsContainer = document.getElementById('pm-elements-container') as HTMLDivElement;
    elementsContainer.style.width = pageWidth + "px";
    elementsContainer.style.backgroundColor = 'white';

    elementsContainer.style.paddingTop = this.pageMargin[0] + 'px';
    elementsContainer.style.paddingRight = this.pageMargin[1] + 'px';
    elementsContainer.style.paddingBottom = this.pageMargin[2] + 'px';
    elementsContainer.style.paddingLeft = this.pageMargin[3] + 'px';

    let previewContainer = document.getElementsByClassName('preview-container')[0] as HTMLDivElement;
    previewContainer.style.backgroundColor = 'gray';

    elementsContainer.style.margin = '10px auto'
    /* elementsContainer.style.marginRight = '10px';
    elementsContainer.style.marginTop = '10px';
    elementsContainer.style.marginBottom = '10px';
    elementsContainer.style.marginLeft = '10px'; */

    /* let hrLinesContainer = (document.getElementById('hr-lines') as HTMLDivElement);
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

    } */
    //pdfmake()
    //[left, top, right, bottom]
    this.data.pageMargins = [this.pageMargin[3], this.pageMargin[0], this.pageMargin[1], this.pageMargin[2]];

    /* let newPdfData: any = { content: [], styles: {}, images: [], defaultStyle: {} }
    newPdfData.pageMargins = [pagePadding, pagePadding, pagePadding, pagePadding]; */

    let generateFigure = async (element: Element) => {
      let figureTable: any = {
        color: 'black',
        table: {
          widths: ['4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%', '4.16667%'],
          body: [],
          props: { type: 'figure' }
        },
        alingment: 'center',
        margin: [0, 0, 0, 15]
      }
      let figuresCount = element.firstChild?.childNodes.length!;
      let figuresViewsContainer = element.firstChild!
      let figuresDescriptions = element.childNodes.item(1)!;

      let figureHeader = figuresDescriptions.childNodes.item(0).textContent;
      let figureDescription = figuresDescriptions.childNodes.item(1).textContent;

      let figuresData: { dataUrl: string, src: string, description: string, name: string, descName: string }[] = []
      let figureNumber = figureHeader?.split(' ')[1]

      for (let i = 0; i < figuresCount; i++) {
        let img = (figuresViewsContainer.childNodes.item(i) as HTMLElement).getElementsByTagName('img').item(0)!
        let src = img.src
        let dataURLString = await this.getDataUrl(img)

        let descText = (figuresDescriptions.childNodes.item(i + 2) as HTMLElement).textContent!;
        let description = descText.split(':')[1].trim();
        let imgName = 'figure' + figureNumber + i;
        figuresData.push({ dataUrl: dataURLString, src, description, name: imgName, descName: descText.split(':')[0].trim() + ':' });
      }


      let figuresPdfViews: any = []
      let figuresPdfDescriptions: any = []

      let usedFrame = twoImgOnRowWidth;

      for (let i = 0; i < figuresCount; i += 2) {
        if (figuresData[i] && figuresData[i + 1]) {
          let name1 = figuresData[i].dataUrl;
          let desc1 = figuresData[i].description
          let descLabel1 = figuresData[i].descName

          let name2 = figuresData[i + 1].dataUrl;
          let desc2 = figuresData[i + 1].description
          let descLabel2 = figuresData[i + 1].descName


          figuresPdfViews.push([
            { image: name1, colSpan: 12, width: usedFrame, alignment: 'center' }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
            { image: name2, colSpan: 12, width: usedFrame, alignment: 'center' }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
          figuresPdfDescriptions.push([
            { text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
            { text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
        } else {
          let name1 = figuresData[i].dataUrl;
          let desc1 = figuresData[i].description
          let descLabel1 = figuresData[i].descName


          figuresPdfViews.push([
            { image: name1, colSpan: 12, width: usedFrame, alignment: 'center' }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},
            { text: '', colSpan: 12, }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},])
          figuresPdfDescriptions.push([
            { text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 23 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {},])
        }

      }

      figureTable.table.body.push(...figuresPdfViews);
      figureTable.table.body.push([{ text: figureHeader, colSpan: 24, }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
      figureTable.table.body.push([{ text: 'Description:', colSpan: 4, }, {}, {}, {}, { text: figureDescription, colSpan: 20 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
      figureTable.table.body.push(...figuresPdfDescriptions);
      return { pdfFigure: figureTable, data: figuresData }
    }

    let generatePDFData = async (element: Element, parentPDFel?: any, parentStyle?: any, parentElement?: Element) => {
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
        tag == 'sub' ||
        tag == 'sup' ||
        tag == 'citation' ||
        tag == 'u' ||
        tag == 'em' ||
        tag == 'form-field'
      ) {
        let newEl: any = {}
        let textStyles = this.getTextStyles(defaultView!.getComputedStyle(element, null), element as HTMLElement);
        if (parentStyle && parentStyle.parentWidth) {
          textStyles.parentWidth = parentStyle.parentWidth
        }
        if (parentStyle) {
          Object.keys(parentStyle).forEach((key) => {
            if (!textStyles[key] && key !== 'text' && key !== 'stack') {
              textStyles[key] = parentStyle[key];
            }
          })
        }
        if (element.childNodes.length == 1 && element.childNodes[0] instanceof Text) {
          newEl.text = element.childNodes[0].textContent;
          Object.assign(newEl, textStyles)
        } else if ((element.childNodes.length > 1 &&
          (
            tag == 'h1' ||
            tag == 'h2' ||
            tag == 'h3' ||
            tag == 'h4' ||
            tag == 'h5' ||
            tag == 'h6' ||
            tag == 'form-field'
          )) || (element.childNodes.length == 1 && (
            tag == 'h1' ||
            tag == 'h2' ||
            tag == 'h3' ||
            tag == 'h4' ||
            tag == 'h5' ||
            tag == 'h6' ||
            tag == 'form-field'
          ) /* && (
              (element.childNodes[0] as HTMLElement).tagName.toLocaleLowerCase() == 'h1' ||
              (element.childNodes[0] as HTMLElement).tagName.toLocaleLowerCase() == 'h2' ||
              (element.childNodes[0] as HTMLElement).tagName.toLocaleLowerCase() == 'h3' ||
              (element.childNodes[0] as HTMLElement).tagName.toLocaleLowerCase() == 'h4' ||
              (element.childNodes[0] as HTMLElement).tagName.toLocaleLowerCase() == 'h5' ||
              (element.childNodes[0] as HTMLElement).tagName.toLocaleLowerCase() == 'h6' ||
              (element.childNodes[0] as HTMLElement).tagName.toLocaleLowerCase() == 'form-field')*/)) {
          let children = element.childNodes;


          for (let i = 0; i < children.length; i++) {
            let node = children[i];
            let n: any
            if (node instanceof Text) {
              n = node.textContent
            } else if (node instanceof Element) {
              n = await generatePDFData(node, newEl, textStyles, element)
            }
            if (!newEl.stack) {
              newEl.stack = [];
            }
            newEl.stack.push(n);
          }
          Object.assign(newEl, textStyles)
        } else {
          //serch for inline img , math , video or svg node;
          let inlineBreakableNodes = ['img', 'video', 'svg', 'math-inline', 'a'];
          let elementHasLBN = false
          let serchNodes = (el: HTMLElement) => {
            if (el.tagName) {
              let eltag = el.tagName.toLocaleLowerCase()
              if (inlineBreakableNodes.includes(eltag)) {
                elementHasLBN = true
              }
            }
            if (el.childNodes.length > 0) {
              el.childNodes.forEach((child) => {
                serchNodes(child as HTMLElement);
              })
            }
          }
          serchNodes(element as HTMLElement);
          if (elementHasLBN) {
            let elementInnerHTML = element.innerHTML;
            let counter = 0;
            let lineWidth = 0;

            let loopAndParseChildren = (element: HTMLElement, main?: boolean) => {
              if (element.tagName && !inlineBreakableNodes.includes(element.tagName.toLocaleLowerCase()) && element.childNodes.length > 0) {
                for (let i = 0; i < element.childNodes.length; i++) {

                  loopAndParseChildren(element.childNodes[i] as HTMLElement);
                }
                if (!main) {
                  let elementChildren = [...Array.from(element.childNodes)];
                  elementChildren.forEach((ch) => { element.removeChild(ch) });
                  let newOuterHTML = ''
                  elementChildren.forEach((ch) => {
                    if (ch instanceof HTMLElement) {
                      element.innerHTML = ch.outerHTML;
                    } else if (ch instanceof Text) {
                      element.innerHTML = ch.textContent!;
                    }
                    newOuterHTML += element.outerHTML
                    element.innerHTML = ''
                  })
                  let container = document.createElement('div');
                  container.innerHTML = newOuterHTML
                  element.replaceWith(...Array.from(container.childNodes))
                }
              } else if (element instanceof Text) {
                let countBefore = 0;
                let shouldStop = false;
                while (element.textContent!.length > 10 && !shouldStop) {
                  let count = element.textContent!.length - 1;
                  countBefore = +count;
                  while (element.textContent!.length - count < 20 && count > 0 && (element.textContent![count] !== " " || count == countBefore)) {
                    count--;
                  }
                  if (count !== 0 && countBefore !== count) {
                    element.splitText(count);
                  }
                  if (countBefore == count || count == 0) {
                    shouldStop = true
                  }
                }
              }
            }
            loopAndParseChildren(element as HTMLElement, true);
            newEl.stack = [];
            let buildLineTables = async (stack: any[], pageWidth: number, element: HTMLElement) => {
              let elCount = 0;
              let lineWidth = 4;
              let chN = element.childNodes
              while (elCount < chN.length) {
                let child = chN.item(elCount) as HTMLElement;
                let tableTemplate = {
                  table: {
                    body: [[]]
                  },
                  layout: {
                    paddingLeft: function (i: number, node: any) { return 2; },
                    paddingRight: function (i: number, node: any) { return 2; },
                    paddingTop: function (i: number, node: any) { return 0; },
                    paddingBottom: function (i: number, node: any) { return 0; },
                    hLineWidth: function hLineWidth(i: number) { return 0; },
                    vLineWidth: function vLineWidth(i: number) { return 0; },
                  }
                }
                let childWidth: number;
                let getWidth = (el: HTMLElement) => {
                  let childWidth: any
                  if (child.clientWidth || (child.getBoundingClientRect && child.getBoundingClientRect().width > 0)) {
                    if (child.tagName && child.tagName.toLocaleLowerCase() == "a") {
                      let container = document.getElementById('width-measure-container')!;
                      container.innerHTML = element.outerHTML;
                      (container.firstChild! as HTMLElement).style.fontSize = textStyles.fontSize + 'px';
                      (container.firstChild! as HTMLElement).innerHTML = child.textContent! + ' ' + (child as HTMLAnchorElement).href;
                      childWidth = container.clientWidth!
                    } else {
                      childWidth = child.clientWidth! !== 0 ? child.clientWidth : child.getBoundingClientRect().width
                    }
                  } else {
                    let container = document.getElementById('width-measure-container')!;
                    container.innerHTML = element.outerHTML;
                    (container.firstChild! as HTMLElement).style.fontSize = textStyles.fontSize + 'px';
                    (container.firstChild! as HTMLElement).innerHTML = child.textContent!;
                    childWidth = container.clientWidth!
                  }
                  return childWidth
                }
                if (elCount < chN.length) {
                  child = chN.item(elCount) as HTMLElement;
                  childWidth = getWidth(child)
                }
                //@ts-ignore
                while (lineWidth + childWidth + 15 < pageWidth && elCount < chN.length) {
                  if (child instanceof Text) {
                    let n: any = { text: child.textContent };
                    Object.assign(n, textStyles)
                    //@ts-ignore
                    tableTemplate.table.body[0].push(n)
                  } else {
                    //@ts-ignore
                    tableTemplate.table.body[0].push(await generatePDFData(child, newEl, textStyles, element))
                  }
                  lineWidth += childWidth! + 15;
                  elCount++;
                  if (elCount < chN.length) {
                    child = chN.item(elCount) as HTMLElement;
                    childWidth = getWidth(child)
                  }
                }
                lineWidth = 0;
                stack.push(tableTemplate);
              }
            }
            await buildLineTables(newEl.stack, parentStyle && parentStyle.parentWidth ? parentStyle.parentWidth : pageWidth, element as HTMLElement);

          } else {
            if (!newEl.text) {
              newEl.text = [];
            }
            let children = element.childNodes;
            for (let i = 0; i < children.length; i++) {
              let node = children[i];
              let n: any
              if (node instanceof Text) {
                n = node.textContent
              } else if (node instanceof Element) {
                n = await generatePDFData(node, newEl, textStyles, element)
              }

              newEl.text.push(n);
            }
          }
          Object.assign(newEl, textStyles)
        }
        let parentElTag;
        if (parentElement) {
          parentElTag = parentElement.tagName.toLocaleLowerCase();
        }
        if ((!parentStyle ||
          (
            parentElTag == 'h1' ||
            parentElTag == 'h2' ||
            parentElTag == 'h3' ||
            parentElTag == 'h4' ||
            parentElTag == 'h5' ||
            parentElTag == 'h6' ||
            parentElTag == 'form-field'
          )) && !(
            tag == 'h1' ||
            tag == 'h2' ||
            tag == 'h3' ||
            tag == 'h4' ||
            tag == 'h5' ||
            tag == 'h6' ||
            tag == 'form-field'
          )) {
          newEl.margin = [0, 0, 0, 15]
        }
        if (newEl.background == '#ffd0d0' && newEl.decoration == 'lineThrough') {
          newEl.decoration = undefined;
        }
        if (newEl.background) {
          newEl.background = undefined;
        }
        if (typeof newEl.text == 'string' && newEl.text.includes('Cited item deleted')) {
          newEl.text = '';
        }
        if (!parentPDFel) {
          newEl.props = { main: true }
        }
        return Promise.resolve(newEl)
      } else if (tag == 'img') {
        if (element.className = "ProseMirror-separator") {
          return {};
        }
        let img = element as HTMLImageElement


       let dataURL = await this.getDataUrl(img)

        return { image: dataURL, width: pxToPt(img.getBoundingClientRect().width) }
      } else if (tag == 'block-figure') {
        let pdfFigure = await generateFigure(element);
        if (!parentPDFel) {
          pdfFigure.pdfFigure.props = { main: true }
        }
        return Promise.resolve(pdfFigure.pdfFigure)
      } else if (tag == 'table' || (tag == 'div' && element.className == 'tableWrapper')) {
        let tableElement
        if ((tag == 'div' && element.className == 'tableWrapper')) {
          tableElement = element.firstChild! as HTMLElement
        } else {
          tableElement = element
        }
        let sectionName = tableElement.getAttribute('section-name');
        if (sectionName == 'Taxonomic coverage') {
          let tabbleCellWidth = '4.16667%'
          let tabbleCellWidthNumber = +tabbleCellWidth.replace('%', '')
          let taxonomicTable: any = {
            color: 'black',
            table: {
              headerRows: 1,
              widths: [],
              body: [],
              props: { type: 'taxonomicTable' }
            },
            alingment: 'center',
            margin: [0, 0, 0, 15]
          }
          for (let i = 0; i < 24; i++) {
            taxonomicTable.table.widths.push(tabbleCellWidth)
          }
          if (!parentPDFel) {
            taxonomicTable.props = { main: true }
          }
          let tbody = tableElement.getElementsByTagName('tbody').item(0)!;
          let tbodyCh = tbody.childNodes;
          for (let i = 0; i < tbodyCh.length; i++) {
            let el = tbodyCh[i]

            let outerWidth = parentStyle && parentStyle.parentWidth ? parentStyle.parentWidth : pageWidth

            let col1Span = 4
            let stack1: any = []
            let cell1Nodes = el.childNodes.item(0).childNodes
            for (let j = 0; j < cell1Nodes.length; j++) {
              let cellnode = cell1Nodes[j];
              let val = await generatePDFData(cellnode as Element, taxonomicTable, { parentWidth: (col1Span * tabbleCellWidthNumber) * outerWidth / 100 }, tableElement)
              stack1.push(val);
            }
            let col2Span = 10
            let stack2: any = []
            let cell2Nodes = el.childNodes.item(1).childNodes
            for (let j = 0; j < cell2Nodes.length; j++) {
              let cellnode = cell2Nodes[j];
              let val = await generatePDFData(cellnode as Element, taxonomicTable, { parentWidth: (col2Span * tabbleCellWidthNumber) * outerWidth / 100 }, tableElement)
              stack2.push(val);
            }
            let col3Span = 10
            let stack3: any = []
            let cell3Nodes = el.childNodes.item(2).childNodes
            for (let j = 0; j < cell3Nodes.length; j++) {
              let cellnode = cell3Nodes[j];
              let val = await generatePDFData(cellnode as Element, taxonomicTable, { parentWidth: (col3Span * tabbleCellWidthNumber) * outerWidth / 100 }, tableElement)
              stack3.push(val);
            }
            taxonomicTable.table.body.push([
              { stack: stack1, colSpan: col1Span }, {}, {}, {},
              { stack: stack2, colSpan: col2Span }, {}, {}, {}, {}, {}, {}, {}, {}, {},
              { stack: stack3, colSpan: col3Span }, {}, {}, {}, {}, {}, {}, {}, {}, {}])
          }
          return Promise.resolve(taxonomicTable)
        } else {
          let tbody = tableElement.getElementsByTagName('tbody').item(0)!;
          let nOfColums = tbody.childNodes.item(0).childNodes.length;

          let baseTable: any = {
            color: 'black',
            table: {
              headerRows: 1,
              widths: [],
              body: [],
              props: { type: 'taxonomicTable' }
            },
            alingment: 'center',
            margin: [0, 0, 0, 15]
          }
          if (!parentPDFel) {
            baseTable.props = { main: true }
          }

          for (let i = 0; i < nOfColums; i++) {
            baseTable.table.widths.push(100 / nOfColums + '%');
          }

          let tabbleCellWidthNumber
          if (parentStyle && parentStyle.parentWidth) {
            tabbleCellWidthNumber = ((1 / nOfColums) * parentStyle.parentWidth) - 6;
          } else {
            tabbleCellWidthNumber = ((1 / nOfColums) * pageWidth) - 6;
          }
          let rows = tbody.childNodes;
          for (let i = 0; i < rows.length; i++) {
            let htmlrow = rows[i];
            let row: any = []
            let columns = htmlrow.childNodes;
            for (let j = 0; j < columns.length; j++) {
              let cell = columns[j];
              let stack: any = []
              let cellNodes = cell.childNodes
              for (let k = 0; k < cellNodes.length; k++) {
                let cellnode = cellNodes[k]

                let val = await generatePDFData(cellnode as Element, baseTable, { parentWidth: tabbleCellWidthNumber }, tableElement)
                stack.push(val);
              }
              row.push({ stack })
            }
            baseTable.table.body.push(row)
          }
          return Promise.resolve(baseTable)
        }
      } else if (tag == 'ul' || tag == 'ol') {
        let listTemplate: any = {}
        listTemplate[tag] = []
        let elChildren = element.childNodes;
        for (let i = 0; i < elChildren.length; i++) {
          let chnode = elChildren[i];
          let listEl: any = { stack: [] }

          let itemNodes = chnode.childNodes;
          for (let j = 0; j < itemNodes.length; j++) {
            let nodeInItem = itemNodes[j];
            if (nodeInItem.textContent?.trim() !== '') {
              let itemWidth
              if (parentStyle && parentStyle.parentWidth) {
                itemWidth = parentStyle.parentWidth - 50;
              } else {
                itemWidth = pageWidth - 50;
              }
              let pdfFromNode = await generatePDFData(nodeInItem as Element, listTemplate, { parentWidth: itemWidth }, element);
              listEl.stack.push(pdfFromNode);
            }
          }
          listTemplate[tag].push(listEl);
        }
        if (!parentPDFel) {
          listTemplate.props = { main: true }
        }
        return Promise.resolve(listTemplate);
      } else if (tag == 'br') {
        return Promise.resolve({ text: ' \n' })
      } else if (tag == 'a') {
        let linkTemplate = { text: [{ text: element.textContent, color: 'blue' }, { text: element.getAttribute('href'), color: 'lightblue', decoration: 'underline' }] }
        return Promise.resolve(linkTemplate)
      } else if (tag == 'math-inline' || tag == 'math-display') {
        if (tag == 'math-inline') {
          return new Promise((resolve, reject) => {
            toCanvas(element as HTMLElement).then((canvasData: any) => {
              let result
              let canvasWidth = element.clientWidth !== 0 ? element.clientWidth : element.getBoundingClientRect().width;
              if (canvasData.toDataURL() == 'data:,') {
                html2canvas(element as HTMLElement).then((canvasData1) => {
                  let result
                  let canvasWidth = element.clientWidth !== 0 ? element.clientWidth : element.getBoundingClientRect().width;
                  result = { image: canvasData1.toDataURL(), width: pxToPt(canvasWidth) }
                  //resolve(result)
                  resolve(result)
                })
              } else {
                result = { image: canvasData.toDataURL(), width: pxToPt(canvasWidth) }
                //resolve(result)
                resolve(result)
              }
            })
          })
        } else if (tag == 'math-display') {
          return new Promise((resolve, reject) => {
            toCanvas(element as HTMLElement).then((canvasData: any) => {
              let result
              let canvasWidth = +canvasData.style.width.replace('px', '');
              result = { image: canvasData.toDataURL(), width: pxToPt(element.clientWidth) }
              //resolve(result)
              resolve(result)
            })
          })
        }
      } else {
        return Promise.resolve('')
      }
    }

    let val = await new Promise(async (resolve, reject) => {
      let doneSubject = new Subject();
      let cont: any = [];

      let mainNodes = this.elements;
      for (let i = 0; i < mainNodes.length; i++) {
        let el = mainNodes[i] as HTMLElement;
        let pdfElement = await generatePDFData(el);
        if (!pdfElement.props) {
          pdfElement.props = { main: true }
        } else if (!pdfElement.props.main) {
          pdfElement.props.main = true;

        }

        let pbbefore = (el as HTMLElement).getAttribute('page-break-before')
        let pbbafter = (el as HTMLElement).getAttribute('page-break-after')
        let hasPageBreakBefore = pbbefore ? pbbefore == 'true' ? true : false : false;
        let hasPageBreakAfter = pbbafter ? pbbafter == 'true' ? true : false : false;

        if (hasPageBreakBefore) {
          pdfElement.pageBreak = 'before'
        }
        if (hasPageBreakAfter) {
          pdfElement.pageBreak = 'after'
        }
        pdfElement.margin = [0, 0, 0, 15]
        cont.push(pdfElement)
        if (i == mainNodes.length - 1) {

          doneSubject.next('done');
        }
      }
      this.data.content = cont
      this.data.content.push({image:"image1"})
      this.data.images = {}
      this.data.images.image1 = "https://miro.medium.com/max/600/1*HiGTRdjkmzqdcRiSaemB1A.png"
      /* var myjson = JSON.stringify(data, null, 2);
      var x = window.open();
      x!.document.open();
      x!.document.write('<html><body><pre>' + myjson.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</pre></body></html>');
      x!.document.close();
      */

      this.data.orderNodes = (node: any, nodeFunc: any) => {
        let nodeInfo = node.nodeInfo;
        if (nodeInfo.table && nodeInfo.table.props && nodeInfo.table.props.type == 'figure' && node.pageBreak == 'before') {
          let scaling = false;
          if (2 !== node.scaleTry && node.nodeInfo.pageNumbers.length > 1) {
            scaling = true;
            node.pageOrderCalculated = false;
          }
          let structuredNodes = nodeFunc.getContent();
          let nodesBefore = nodeFunc.detAllNodesBefore();
          let nodesAfter = nodeFunc.getAllNodesAfter();

          if (nodesBefore.length > 0) {
            let lastNodeBefore = nodesBefore[nodesBefore.length - 1];
            let availableHeightAfterLastNode = lastNodeBefore.props.availableHeight;

            // check if there is space above for the figure

            if (availableHeightAfterLastNode > node.props.height) {
              node.pageBreak = undefined;
              return true
            }

            // try move text from uder the figure

            let filledSpace = 0;
            let counter = 0;
            let movedIndexes: number[] = []
            let cannotMove = false
            while (counter < nodesAfter.length && !cannotMove) {
              let nAfter = nodesAfter[counter]
              if (nAfter.props.height < availableHeightAfterLastNode - filledSpace && !nAfter.table) {
                filledSpace += nAfter.props.height
                movedIndexes.push(1 + nodesBefore.length + counter);
              } else {
                cannotMove = true
              }
              counter++
            }
            movedIndexes.sort((a, b) => b - a);

            let editData = { moveFrom: movedIndexes, moveTo: nodesBefore.length };

            if (!scaling && movedIndexes.length > 0 && availableHeightAfterLastNode - filledSpace < 200 && lastNodeBefore.props.availableHeight > 200) {
              let nodesToMove = editData.moveFrom;
              let indexToMoveAt = editData.moveTo

              let figureNode = structuredNodes.splice(nodesBefore.length, 1);
              let biggestIndex = Math.max(...movedIndexes);

              /*  let movingNodes: any = []
               nodesToMove.forEach((indx) => {
                 movingNodes.unshift(...structuredNodes.splice(indx, 1));
               })

               movingNodes.forEach((node: any) => {
                 node.pageOrderCalculated = true;
               }) */

              structuredNodes.splice(biggestIndex, 0, figureNode);
              //

              //retrun true so we contonue to the nex node


              return true;
            }

            // try move figure above the text before it


            let freeSpaceBefore = availableHeightAfterLastNode;

            counter = nodesBefore.length - 1;
            movedIndexes = []
            cannotMove = false
            let enoughFreeSpace = false
            while (counter > -1 && !cannotMove && node.props.height < 650 && !enoughFreeSpace) {
              let nBefore = nodesBefore[counter]
              if (freeSpaceBefore < node.props.height && !nBefore.table && nBefore.nodeInfo.pageNumbers.length == 1 && nBefore.nodeInfo.pageNumbers[0] == node.nodeInfo.pageNumbers[0] - 1) {
                if (freeSpaceBefore + nBefore.props.height > node.props.height) {
                  enoughFreeSpace = true;
                }
                freeSpaceBefore += nBefore.props.height
                movedIndexes.push(counter);
              } else {
                cannotMove = true
              }
              counter--
            } /**/
            if (!scaling && movedIndexes.length > 0 && enoughFreeSpace) {
              let moveNodeFrom = nodesBefore.length;
              let moveTo = Math.min(...movedIndexes);

              let movingNode = structuredNodes.splice(moveNodeFrom, 1);
              movingNode[0].pageBreak = undefined;
              structuredNodes.splice(moveTo, 0, ...movingNode);
              return true
            }

            // try scale the images and then the above operations again


            let loopTableAndChangeWidth = (nodeToChange: any, newWidth: number) => {
              if (nodeToChange.table) {
                nodeToChange.table.body.forEach((row: any) => {
                  row.forEach((element: any) => {
                    if (element.image && element.width) {
                      element.width = newWidth;
                    }
                  });
                })
              }
            }

            if (node.scaleTry == 2) {
              return true
            } else {
              if (!node.scaleTry) {
                node.scaleTry = 1
              } else {
                node.scaleTry = 2
              }
              if (node.scaleTry == 1) {
                node.pageOrderCalculated = false;
                loopTableAndChangeWidth(node, threeImgOnRowWidth)
                return true
              } else {
                node.pageOrderCalculated = false;
                loopTableAndChangeWidth(node, fourImgOnRowWidth)
                return true
              }
            }
          }
        }
        return false;
      }
      this.data.pageBreakBefore = (nodeInfo: any, nodeFunc: any) => {
        if (nodeInfo.table && nodeInfo.table.props && nodeInfo.table.props.type == 'figure') {
          if (nodeInfo.pageNumbers.length == 2) {
            return true
          }
        }
        return false;
      }
      this.data.threeImgOnRowWidth = threeImgOnRowWidth;
      this.data.fourImgOnRowWidth = fourImgOnRowWidth;
      this.data.singleimgOnRowWidth = singleimgOnRowWidth;
      this.data.pageSize = this.pageSize;
      /* this.http.post('http://localhost:3000/buildPdf',{pdfJsonStruct:data},{ responseType: 'text' }).subscribe((res)=>{
        (document.getElementById('pdfV') as HTMLIFrameElement).src = res;
      }); */
      pdfMake.createPdf(this.data).getDataUrl((data: any) => {
        //(document.getElementById('pdfV') as HTMLIFrameElement).src = data;
      }).then((data: any) => {
        (document.getElementById('pdfV') as HTMLIFrameElement).src = data;
      });
      resolve(true);
    })
    return Promise.resolve(val)
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
      alignment: element.style.textAlign == 'left'?'justify':element.style.textAlign,
      //@ts-ignore
      color: (elementStyles.color && elementStyles.color.trim() !== "") ? rgbToHex(...elementStyles.color.replace('rgb', '').replace('(', '').replace(')', '').replace('a', '').split(', ').map((el) => +el)) : undefined,
      //@ts-ignore
      background: (elementStyles.backgroundColor && elementStyles.backgroundColor.trim() !== "") ? rgbToHex(...elementStyles.backgroundColor.replace('rgb', '').replace('a', '').replace('(', '').replace(')', '').split(', ').map((el) => +el)) : undefined,
      decoration: elementStyles.textDecorationLine == 'line-through' ? 'lineThrough' : element.tagName == 'U' ? 'underline' : elementStyles.textDecorationLine == 'overline' ? 'overline' : undefined,
      decorationStyle: elementStyles.textDecorationStyle !== 'solid' ? elementStyles.textDecorationStyle : undefined,
      //@ts-ignore
      decorationColor: (elementStyles.textDecorationColor && elementStyles.textDecorationColor.trim() !== '') ? rgbToHex(...elementStyles.textDecorationColor.replace('rgb', '').replace('a', '').replace('(', '').replace(')', '').split(', ').map((el) => +el)) : undefined,
    }

    let clearedStyles: any = {}

    Object.keys(textStyles).forEach((key) => {
      let val = textStyles[key]
      if (val && `${val}`.trim() !== '') {
        clearedStyles[key] = val
      }
    })
    if (elementStyles.textAlign == 'left' || elementStyles.textAlign == 'right' || elementStyles.textAlign == 'center' || elementStyles.textAlign == 'justify') {
      if(elementStyles.textAlign == 'left'){
        clearedStyles.alignment = 'justify'
      }else{
        clearedStyles.alignment = elementStyles.textAlign;
      }
    }

    return clearedStyles
  }

  elementToPdfMakeJson(pdfdata: any, element: Element) {
  }

  drop(event: CdkDragDrop<string[]>, sectionIndex: number) {
    moveItemInArray(this.sectionsContainers[sectionIndex], event.previousIndex, event.currentIndex);
  }
}

/*
            if (figuresCount == 1) {
              let imgName = figuresData[0].name;
              let imgDescription = figuresData[0].description;
              let descLabel = figuresData[0].descName


              figuresPdfViews.push([
                { image: imgName, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {},
                { colSpan: 6, }, {}, {}, {}, {}, {}])
              figuresPdfDescriptions.push([{ text: descLabel, colSpan: 1 }, { text: imgDescription, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

            } else if (figuresCount == 2 || figuresCount == 4) {
              for (let i = 0; i < figuresCount; i += 2) {
                let name1 = figuresData[i].name;
                let desc1 = figuresData[i].description
                let descLabel1 = figuresData[i].descName

                let name2 = figuresData[i + 1].name;
                let desc2 = figuresData[i + 1].description
                let descLabel2 = figuresData[i + 1].descName


                figuresPdfViews.push([
                  { image: name1, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {},
                  { image: name2, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

              }
            } else if (figuresCount == 3 || figuresCount == 5 || figuresCount == 6) {
              if (figuresCount == 3 || figuresCount == 6) {
                for (let i = 0; i < figuresCount; i += 3) {
                  let name1 = figuresData[i].name;
                  let desc1 = figuresData[i].description
                  let descLabel1 = figuresData[i].descName

                  let name2 = figuresData[i + 1].name;
                  let desc2 = figuresData[i + 1].description
                  let descLabel2 = figuresData[i + 1].descName

                  let name3 = figuresData[i + 2].name;
                  let desc3 = figuresData[i + 2].description
                  let descLabel3 = figuresData[i + 2].descName


                  figuresPdfViews.push([
                    { image: name1, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                    { image: name2, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                    { image: name3, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {}
                  ])
                  figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel3, colSpan: 1 }, { text: desc3, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

                }
              } else {
                let name1 = figuresData[0].name;
                let desc1 = figuresData[0].description
                let descLabel1 = figuresData[0].descName

                let name2 = figuresData[1].name;
                let desc2 = figuresData[1].description
                let descLabel2 = figuresData[1].descName

                let name3 = figuresData[2].name;
                let desc3 = figuresData[2].description
                let descLabel3 = figuresData[2].descName


                figuresPdfViews.push([
                  { image: name1, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                  { image: name2, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                  { image: name3, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {}
                ])
                figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel3, colSpan: 1 }, { text: desc3, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

                let name4 = figuresData[3].name;
                let desc4 = figuresData[3].description
                let descLabel4 = figuresData[3].descName

                let name5 = figuresData[4].name;
                let desc5 = figuresData[4].description
                let descLabel5 = figuresData[4].descName

                figuresPdfViews.push([
                  { image: name4, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {},
                  { image: name5, colSpan: 6, fit: [twoImgOnRowWidth, twoImgOnRowWidth] }, {}, {}, {}, {}, {}
                ])
                figuresPdfDescriptions.push([{ text: descLabel4, colSpan: 1 }, { text: desc4, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel5, colSpan: 1 }, { text: desc5, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
              }
            } else if (figuresCount == 7 || figuresCount == 8) {
              if (figuresCount == 8) {
                for (let i = 0; i < figuresCount; i += 4) {
                  let name1 = figuresData[i].name;
                  let desc1 = figuresData[i].description
                  let descLabel1 = figuresData[i].descName

                  let name2 = figuresData[i + 1].name;
                  let desc2 = figuresData[i + 1].description
                  let descLabel2 = figuresData[i + 1].descName

                  let name3 = figuresData[i + 2].name;
                  let desc3 = figuresData[i + 2].description
                  let descLabel3 = figuresData[i + 2].descName

                  let name4 = figuresData[i + 3].name;
                  let desc4 = figuresData[i + 3].description
                  let descLabel4 = figuresData[i + 3].descName


                  figuresPdfViews.push([
                    { image: name1, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                    { image: name2, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                    { image: name3, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                    { image: name4, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {}
                  ])
                  figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel3, colSpan: 1 }, { text: desc3, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                  figuresPdfDescriptions.push([{ text: descLabel4, colSpan: 1 }, { text: desc4, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

                }
              } else {
                let name1 = figuresData[0].name;
                let desc1 = figuresData[0].description
                let descLabel1 = figuresData[0].descName

                let name2 = figuresData[1].name;
                let desc2 = figuresData[1].description
                let descLabel2 = figuresData[1].descName

                let name3 = figuresData[2].name;
                let desc3 = figuresData[2].description
                let descLabel3 = figuresData[2].descName

                let name4 = figuresData[3].name;
                let desc4 = figuresData[3].description
                let descLabel4 = figuresData[3].descName


                figuresPdfViews.push([
                  { image: name1, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                  { image: name2, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                  { image: name3, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {},
                  { image: name4, colSpan: 3, fit: [fourImgOnRowWidth, fourImgOnRowWidth] }, {}, {}
                ])
                figuresPdfDescriptions.push([{ text: descLabel1, colSpan: 1 }, { text: desc1, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel2, colSpan: 1 }, { text: desc2, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel3, colSpan: 1 }, { text: desc3, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel4, colSpan: 1 }, { text: desc4, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

                let name5 = figuresData[4].name;
                let desc5 = figuresData[4].description
                let descLabel5 = figuresData[4].descName

                let name6 = figuresData[5].name;
                let desc6 = figuresData[5].description
                let descLabel6 = figuresData[5].descName

                let name7 = figuresData[6].name;
                let desc7 = figuresData[6].description
                let descLabel7 = figuresData[6].descName

                figuresPdfViews.push([
                  { image: name5, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                  { image: name6, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {},
                  { image: name7, colSpan: 4, fit: [threeImgOnRowWidth, threeImgOnRowWidth] }, {}, {}, {}
                ])
                figuresPdfDescriptions.push([{ text: descLabel5, colSpan: 1 }, { text: desc5, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel6, colSpan: 1 }, { text: desc6, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])
                figuresPdfDescriptions.push([{ text: descLabel7, colSpan: 1 }, { text: desc7, colSpan: 11 }, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}])

              }

            } */
