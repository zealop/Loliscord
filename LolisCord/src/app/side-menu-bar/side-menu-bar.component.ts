import { Component, OnInit } from '@angular/core';
import {Icon} from '../Icon';

@Component({
  selector: 'app-side-menu-bar',
  templateUrl: './side-menu-bar.component.html',
  styleUrls: ['./side-menu-bar.component.scss']
})
export class SideMenuBarComponent implements OnInit {

  icons:Icon[] = [
    {name: "ABC", detail: "1"},
    {name: "DEF", detail: "2"},
    {name: "CLGT", detail: "3"},
    {name: "HAHA", detail: "4"}
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
