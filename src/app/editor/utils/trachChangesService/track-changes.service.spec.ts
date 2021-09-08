import { TestBed } from '@angular/core/testing';

import { TrackChangesService } from './track-changes.service';

describe('TrackChangesService', () => {
  let service: TrackChangesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackChangesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
