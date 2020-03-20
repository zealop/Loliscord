import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlineBoardComponent } from './online-board.component';

describe('OnlineBoardComponent', () => {
  let component: OnlineBoardComponent;
  let fixture: ComponentFixture<OnlineBoardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OnlineBoardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OnlineBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
