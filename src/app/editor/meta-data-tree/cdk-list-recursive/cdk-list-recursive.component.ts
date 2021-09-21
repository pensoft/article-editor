import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import { TreeService } from '../tree-service/tree.service';
import { treeNode } from '../../utils/interfaces/treeNode';
import { DetectFocusService } from '../../utils/detectFocusPlugin/detect-focus.service';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-cdk-list-recursive',
  templateUrl: './cdk-list-recursive.component.html',
  styleUrls: ['./cdk-list-recursive.component.scss']
})
export class CdkListRecursiveComponent implements OnInit {

  @Input()  TREE_DATA!: any[];
  @Output() TREE_DATAChange = new EventEmitter<any>();

  @Input()  startFromIndex!: number;

  @Input()  parentListData!: {expandParentFunc:any,listDiv:HTMLDivElement};
  @Input()  id?: string; // the id of the parent of this node
  focusedId ?:string
  mouseOn ?:string

  icons:string[] = []
  constructor(public treeService:TreeService,public detectFocusService:DetectFocusService, private ChangeDetectorRef:ChangeDetectorRef) { 
    detectFocusService.getSubject().subscribe((focusedEditorId)=>{
      this.focusedId = focusedEditorId
      
      if(this.id !== 'parentList'&&this.TREE_DATA.some((el)=>{return el.id == focusedEditorId})){
        this.expandParentFunc()
      }
    })
  }
  
  ngOnInit(): void {
    this.TREE_DATA.forEach((node:any,index:number)=>{
      this.icons[index] = 'chevron_right';
    })
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.TREE_DATA, event.previousIndex, event.currentIndex);
    
      this.treeService.dragNodeChange(event.previousIndex,event.currentIndex,this.id!)
    
  }

  editNodeHandle(nodeId:string){
    this.treeService.editNodeChange(nodeId)
  }

  addNodeHandle(nodeId:string){
    this.treeService.addNodeChange(nodeId)
  }

  deleteNodeHandle(nodeId:string){
    this.treeService.deleteNodeChange(nodeId,this.id!)
  }

  changeDisplay(div:HTMLDivElement){
    if(div.style.display == 'none'){
      div.style.display = 'block'
    }else{
      div.style.display = 'none'
    }  
  }

  expandParentFunc=()=>{
    if(this.id !== 'parentList'){
      if(this.parentListData){
        if(this.parentListData.listDiv.style.display == 'none'){
          this.parentListData.listDiv.style.display = 'block';
        }
        this.parentListData.expandParentFunc()
      }
    }
  }
  focusIdHold?:string
  showButtons(div:HTMLDivElement,mouseOn:boolean,borderClass:string,focusClass:string,node:any){
    if(mouseOn){
      this.mouseOn = node.id
    }else{
      this.mouseOn = ''
    }
    Array.from(div.children).forEach((el:any)=>{
      if(el.classList.contains('hidden')){
        
          if(mouseOn){
            el.style.display = 'inline';
          }else{
            el.style.display = 'none';
          }
        
      }else if(el.classList.contains('border')){
        if(mouseOn){
          if(this.focusedId == node.id){
            this.focusIdHold = node.id
            this.focusedId = ''
            /* el.classList.add(focusClass); */
          }
          el.className = `border ${borderClass} `
          /* el.classList.remove(borderClass+"Inactive")

          el.classList.remove(borderClass)
          el.classList.add(borderClass)
          
          el.classList.remove(focusClass) */
          
          el.children.item(0).style.display = 'inline'
        }else{
          if(this.focusIdHold == node.id){

            this.focusedId = this.focusIdHold
            this.focusIdHold = '';

            /* el.classList.add(focusClass); */
          }
          el.className = `border ${borderClass}Inactive`

          
          /* el.classList.remove(borderClass)
          el.classList.remove(borderClass)
          el.classList.add(borderClass+"Inactive") */
          el.children.item(0).style.display = 'none'
        }
      }
    })
  }

 
}
