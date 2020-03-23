import { Component, OnInit } from '@angular/core';
import { $ } from 'protractor';

@Component({
  selector: 'app-settingchannel',
  templateUrl: './settingchannel.component.html',
  styleUrls: ['./settingchannel.component.scss']
})
export class SettingchannelComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  isOpenMenu: boolean = false;

  popUpMenu(event){
    console.log(event);
    if(this.isOpenMenu == false){
      this.isOpenMenu = true;
    }
    else {
      this.isOpenMenu = false;
    }
  }

  
}
