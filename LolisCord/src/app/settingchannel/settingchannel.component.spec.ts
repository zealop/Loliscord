import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SettingchannelComponent } from './settingchannel.component';

describe('SettingchannelComponent', () => {
  let component: SettingchannelComponent;
  let fixture: ComponentFixture<SettingchannelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SettingchannelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingchannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
