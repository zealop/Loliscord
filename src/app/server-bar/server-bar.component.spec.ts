import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServerBarComponent } from './server-bar.component';

describe('ServerBarComponent', () => {
  let component: ServerBarComponent;
  let fixture: ComponentFixture<ServerBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServerBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServerBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
