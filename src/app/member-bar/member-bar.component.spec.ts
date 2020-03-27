import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberBarComponent } from './member-bar.component';

describe('MemberBarComponent', () => {
  let component: MemberBarComponent;
  let fixture: ComponentFixture<MemberBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
