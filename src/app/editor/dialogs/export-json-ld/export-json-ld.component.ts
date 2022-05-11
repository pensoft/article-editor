import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { articleSection } from '@app/editor/utils/interfaces/articleSection';

@Component({
  selector: 'app-export-json-ld',
  templateUrl: './export-json-ld.component.html',
  styleUrls: ['./export-json-ld.component.scss']
})
export class ExportJsonLdComponent implements AfterViewInit {

  articleSectionsStructure?: any[]
  articleSectionsStructureFlat?: any[]
  sectionsContainers: string[][] = []
  importantLeafNodes: string[] = [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p',
    'table',
    'br',
    'img',
    'block-figure',
    'ol',
    'ul',
    'math-display',
    'page-break',
    'form-field-inline-view',
    'form-field-inline',
  ];
  elements: Element[] = []
  @ViewChild('elementsContainer', { read: ElementRef }) elementsContainer?: ElementRef;

  constructor(
    private serviceShare: ServiceShare,
    private changeDetectorRef: ChangeDetectorRef,
    public dialogRef: MatDialogRef<ExportJsonLdComponent>,
  ) { }

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
    this.articleSectionsStructureFlat?.push({ title: { name: 'EndEditor' } })
    return articleSectionsStructureFlat
  }

  async ngAfterViewInit() {
    let articleElement = document.getElementById('app-article-element') as HTMLElement;
    let prosemirrorEditors = articleElement.getElementsByClassName('ProseMirror-example-setup-style');
    this.articleSectionsStructure = this.serviceShare.YdocService!.articleStructure?.get('articleSectionsStructure');
    this.makeFlat()

    let loopChildrenRecursivly = (element: Element, sectionContainer: string[], section?: articleSection) => {
      Array.from(element.children).forEach((elChild) => {

        if (this.importantLeafNodes.includes(elChild.tagName.toLocaleLowerCase())) {
          let html = elChild.outerHTML;
          let result = /^<\S+/gm.exec(html)
          let newHtml = html.replace(result![0], result![0] + ' section-name="' + section!.title.name + '"')
          sectionContainer.push(newHtml)
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
  }


  ngOnInit(): void {
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

  refreshContent = async () => {
    this.fillElementsArray()

    let elementsContainerElements = (this.elementsContainer?.nativeElement as Element)
    let mainNodes = this.elements;
    let cont: any = [];

    let pbs = 0 // page breaks
    for (let i = 0; i < mainNodes.length; i++) {
      let el = mainNodes[i] as HTMLElement;
      if (el.tagName.toLocaleLowerCase() == 'page-break') {
        if (cont[i - 1 - pbs]) {
          cont[i - 1 - pbs].pageBreak = 'after';
        }
        pbs++;
      } else {
        let htmlElement = el;
      }
      if (i == mainNodes.length - 1) {
       //done
      }
    }
  }

}
