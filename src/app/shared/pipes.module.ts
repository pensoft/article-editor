import { NgModule, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { SafePipe } from './pipes/videoSaveUrl';



@NgModule({
  declarations:[
    SafePipe
  ],
  exports: [
    SafePipe
  ],
  providers: [
  ]
})
export class PipesModule { }
