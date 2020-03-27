import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelChatComponent } from './channel-chat.component';

describe('ChannelChatComponent', () => {
  let component: ChannelChatComponent;
  let fixture: ComponentFixture<ChannelChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChannelChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChannelChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
