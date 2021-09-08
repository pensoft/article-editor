import { AfterViewInit, Component, OnInit } from '@angular/core';
import { CommentsService } from '../utils/commentsService/comments.service';

@Component({
  selector: 'app-comments-section',
  templateUrl: './comments-section.component.html',
  styleUrls: ['./comments-section.component.scss']
})
export class CommentsSectionComponent implements AfterViewInit,OnInit {

  comments :any[]= [];
  commentsObj :any;

  constructor(private commentsService:CommentsService) { }

  ngOnInit(){
    this.commentsObj = this.commentsService.getData()
    this.comments = (Object.values(this.commentsObj) as Array<any>).flat()
  }

  ngAfterViewInit(): void {
    
    this.commentsService.commentsVisibilityChange.subscribe((commentsObj)=>{
      this.commentsObj = commentsObj
      this.comments = (Object.values(commentsObj) as Array<any>).flat()
    })
  }

}
