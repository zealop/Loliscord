import { Component, OnInit } from '@angular/core';
import {Icon} from '../Icon';

@Component({
  selector: 'app-side-menu-bar',
  templateUrl: './side-menu-bar.component.html',
  styleUrls: ['./side-menu-bar.component.scss']
})
export class SideMenuBarComponent implements OnInit {

  icons:Icon[] = [
    {name: "ABC"},
    {name: "DEF"},
    {name: "CLGT"},
    {name: "HAHA"}
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
