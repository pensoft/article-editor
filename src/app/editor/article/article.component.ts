import { Component, OnInit } from '@angular/core';
import { uuidv4 } from 'lib0/random';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../services/ydoc.service';
import { articleSection } from '../utils/interfaces/articleSection';
import { ChangeDetectorRef } from '@angular/core';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { FiguresControllerService } from '../services/figures-controller.service';
import { figure } from '../utils/interfaces/figureComponent';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { ServiceShare } from '../services/service-share.service';
import { RefsApiService } from '@app/layout/pages/library/lib-service/refs-api.service';
import { CslService } from '@app/layout/pages/library/lib-service/csl.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  articleSectionsStructureFlat?: articleSection[]
  articleSectionsStructure: articleSection[]
  articleStructureMap: YMap<any>
  articleFigures?: figure[]
  reload = true
  constructor(
    private ydocService: YdocService,
    private ref: ChangeDetectorRef,
    public prosemirrorEditorsService: ProsemirrorEditorsService,
    public figuresControllerService: FiguresControllerService,
    public detectFocusService: DetectFocusService,
    public serviceShare:ServiceShare,
    private refsAPI:RefsApiService,
    private cslService:CslService,
  ) {
    this.articleStructureMap = this.ydocService.articleStructure!;
    this.ydocService.articleStructure!.observe((data) => {
      this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
      console.log(this.articleSectionsStructure);
      let change = this.serviceShare?.TreeService?.metadatachangeMap!.get('change');
      if(change &&(change.action == 'editNode'||change.action == 'saveNewTitle')&&this.serviceShare.TreeService!.findNodeById(change.nodeId||change.node.sectionID)?.active){
        return;
      }
      this.makeFlat();
      setTimeout(() => {
        if (this.detectFocusService.sectionName) {
          if(!this.prosemirrorEditorsService.editorContainers[this.detectFocusService.sectionName]){
            this.detectFocusService.sectionName = undefined;
          }else{
            let editorView = this.prosemirrorEditorsService.editorContainers[this.detectFocusService.sectionName].editorView
            editorView.focus();
            editorView.dispatch(editorView.state.tr.scrollIntoView());
          }

        }
      }, 10)

    })
    this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
    this.makeFlat();
    this.articleFigures = this.ydocService.figuresMap?.get('ArticleFigures');
  }

  logYdoc() {
  }

  ngOnInit(): void {
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
    makeFlat(this.articleSectionsStructure)
    this.articleSectionsStructureFlat = []
    setTimeout(() => {
      this.articleSectionsStructureFlat = articleSectionsStructureFlat
    }, 10)
    return articleSectionsStructureFlat
  }

}
