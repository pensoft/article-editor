import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import katex from 'katex';

@Component({
  selector: 'app-testing',
  templateUrl: './testing.component.html',
  styleUrls: ['./testing.component.scss']
})
export class TestingComponent implements OnInit {
  KatexInput = new FormControl('')
  constructor(private dialogRef: MatDialogRef<TestingComponent>,) { }

  ngOnInit(): void {
  }

  render(){
    let katexInput = this.KatexInput.value;
    let katexOutputEl = document.getElementById('katex-display')
    katex.render(katexInput,katexOutputEl,{displayMode:true,leqno:true,fleqn:true});
  }

  cancelFiguresEdit() {
    this.dialogRef.close()
  }
}
