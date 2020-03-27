import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelBarComponent } from './channel-bar.component';

describe('ChannelBarComponent', () => {
  let component: ChannelBarComponent;
  let fixture: ComponentFixture<ChannelBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
