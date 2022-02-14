import { Component, OnInit } from '@angular/core';
import { TrackChangesService } from '../utils/trachChangesService/track-changes.service';

@Component({
  selector: 'app-changes-section',
  templateUrl: './changes-section.component.html',
  styleUrls: ['./changes-section.component.scss']
})
export class ChangesSectionComponent implements OnInit {

  changesObj: any[] = []
  changes: any[] = []

  constructor(private changesService: TrackChangesService) { }

  ngOnInit() {
    this.changesObj = this.changesService.getData()
    this.changes = (Object.values(this.changesObj) as Array<any>).flat()

  }

  ngAfterViewInit(): void {

    this.changesService.changesVisibilityChange.subscribe((changesObj) => {
      this.changesObj = changesObj
      this.changes = (Object.values(this.changesObj) as Array<any>).flat()
    })
  }
}
