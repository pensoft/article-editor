import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-export-options',
  templateUrl: './export-options.component.html',
  styleUrls: ['./export-options.component.scss']
})
export class ExportOptionsComponent implements OnInit {

  selectedType: 'pdf' | 'rtf' | 'msWord' | 'jatsXml' = 'pdf';
  path = 'C:/users/User1/Descktop'
  constructor() { }

  ngOnInit(): void {
  }

}
