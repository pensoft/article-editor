import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from './pipes/videoSaveUrl';
import { htmlPipe } from './pipes/htmlPipe';

let comp = [
  htmlPipe,
  SafePipe
]


@NgModule({
  declarations:[
    ...comp
  ],
  exports: [
    ...comp
  ],
  providers: [
  ]
})
export class PipesModule { }
