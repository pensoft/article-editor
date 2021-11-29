import { Component, OnInit } from '@angular/core';
import { uuidv4 } from 'lib0/random';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../services/ydoc.service';
import { articleSection } from '../utils/interfaces/articleSection';
import { ChangeDetectorRef } from '@angular/core';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss']
})
export class ArticleComponent implements OnInit {

  articleSectionsStructureFlat ?: articleSection[]  
  articleSectionsStructure:articleSection[]
  articleStructureMap :YMap<any>
  reload= true
  constructor(private ydocService:YdocService,private ref: ChangeDetectorRef,public prosemirrorEditorsService:ProsemirrorEditorsService) {
   
    this.articleStructureMap = this.ydocService.articleStructure!;
    this.ydocService.articleStructure!.observe((data)=>{
      this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
      this.makeFlat();
      
    })
    this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
    this.makeFlat();
  }

  logYdoc(){
    //console.log(this.ydocService.ydoc);
  }

  ngOnInit(): void {
  }

  makeFlat(){
    let articleSectionsStructureFlat:any = []
    let makeFlat = (structure:articleSection[]) => {
      structure.forEach((section)=>{
        if(section.active){
          articleSectionsStructureFlat.push(section)
        }
        if(section.children.length>0){
          makeFlat(section.children)
        }
      })
    }
    makeFlat(this.articleSectionsStructure)
    this.articleSectionsStructureFlat = []
    setTimeout(()=>{
      this.articleSectionsStructureFlat = articleSectionsStructureFlat
    },10)
  }

}
