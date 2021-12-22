import { TestBed } from '@angular/core/testing';

import { SearchTemplateService } from './search-template.service';

describe('SearchTemplateService', () => {
  let service: SearchTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
