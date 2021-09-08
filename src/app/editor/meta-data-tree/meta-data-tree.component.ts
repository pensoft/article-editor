import { ArrayDataSource } from '@angular/cdk/collections';
import { NestedTreeControl } from '@angular/cdk/tree';
import { sectionNode } from '../utils/interfaces/section-node'
import { ChangeDetectorRef, Injectable,Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { YdocService } from '../services/ydoc.service';
import { YMap } from 'yjs/dist/src/internals';


@Component({
  selector: 'app-meta-data-tree',
  templateUrl: './meta-data-tree.component.html',
  styleUrls: ['./meta-data-tree.component.scss']
})

export class MetaDataTreeComponent implements OnInit {

  TREE_DATA?:sectionNode[]
  metadataMap?:YMap<any>
  treeControl : NestedTreeControl<sectionNode>;
  dataSource : ArrayDataSource<sectionNode>;

  hasChild = (_: number, node: sectionNode) => !!node.children && node.children.length > 0;
  constructor(private ydocService:YdocService,private changedetectREf:ChangeDetectorRef ) {
    this.treeControl = new NestedTreeControl<sectionNode>(node => node.children);
    this.dataSource = new ArrayDataSource(this.TREE_DATA!);
  }
  tracker =()=>{}
  ngOnInit(): void {
    // зареждаме метадата за дървото от Ydoc
    this.metadataMap = this.ydocService.getMetaDataMap()
    this.TREE_DATA = this.metadataMap!.get('TREE_DATA')
    /* this.metadataMap.observe((update)=>{
      this.changedetectREf.detectChanges()
    })
    this.TREE_DATA = this.metadataMap.get('TREE_DATA')
    this.flatA(this.TREE_DATA!)
    let obj = [
      {
        name: 'Article metadata',
        children: [
          { name: 'Title', active: true },
          { name: 'Abstract & Keywords', active: false },
          { name: 'Classifications', active: false },
          { name: 'Funder', active: false },
        ]
      }, { name: 'Introduction', active: true },
      { name: 'General description', active: false },
      { name: 'Project description', active: false },
      { name: 'Sampling methods', active: false },
      { name: 'Geographic coverage', active: true },
      { name: 'Taxonomic coverage', active: false },
      { name: 'Traits coverage', active: false },
      { name: 'Temporal coverage', active: true },
      { name: 'Collection data', active: false },
      { name: 'Usage rights', active: false },
      { name: 'Data resources', active: false },
      { name: 'Additional information', active: false },
      { name: 'Acknowledgements', active: false },
      { name: 'Author contributions', active: false },
    
    ]; */
    console.log(this.TREE_DATA);
    this.treeControl = new NestedTreeControl<sectionNode>(node => node.children);
    this.dataSource = new ArrayDataSource(this.TREE_DATA!);
  

  }
  flatSectionData: string[] = [];
  flatA = (a: sectionNode[]) => {
    a.forEach((el) => {
      if(el.children){
        this.flatA(el.children) 
      }else{
        this.flatSectionData.push(el.name);
      }
    })
  }

  addSection(name:string){
    // намира индекса на кликнатата секция
    let i :number
    this.flatSectionData.forEach((section,index)=>{
      if(section == name){
        i = index
      }
    })
    /* this.metadataMap?.set('TREE_DATA',this.TREE_DATA)
    this.TREE_DATA = this.metadataMap!.get('TREE_DATA') */
  
  }

  deleteSection(name:string){

    // намира индекса на кликнатата секция
    let i :number
    this.flatSectionData.forEach((section,index)=>{
      if(section == name){
        i = index
      }
    })
    /* this.metadataMap?.set('TREE_DATA',this.TREE_DATA)
    this.TREE_DATA = this.metadataMap!.get('TREE_DATA') */
  
  }
}
