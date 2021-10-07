import { Component, OnInit } from '@angular/core';
import { uuidv4 } from 'lib0/random';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../services/ydoc.service';
import { articleSection } from '../utils/interfaces/articleSection';
import { ChangeDetectorRef } from '@angular/core';

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
  constructor(private ydocService:YdocService,private ref: ChangeDetectorRef) {
    /* this.ydocService.ydocXmlCopy.subscribe((data)=>{
      if(data!==this.copy){
        this.copy = data
        if(data == false){
          this.articleSectionsStructure = this.ydocService.articleStructure!.get('articleSectionsStructureFlat'); 
        }
      }
    }) */
    this.articleStructureMap = this.ydocService.articleStructure!;
    this.articleStructureMap.observe((data)=>{
      this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
      this.makeFlat();
      
    })
    this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
    this.makeFlat();
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
