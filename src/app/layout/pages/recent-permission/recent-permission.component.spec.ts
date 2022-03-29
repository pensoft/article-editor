import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentPermissionComponent } from './recent-permission.component';

describe('RecentPermissionComponent', () => {
  let component: RecentPermissionComponent;
  let fixture: ComponentFixture<RecentPermissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RecentPermissionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecentPermissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
