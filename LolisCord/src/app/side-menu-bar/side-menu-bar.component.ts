import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-side-menu-bar',
  templateUrl: './side-menu-bar.component.html',
  styleUrls: ['./side-menu-bar.component.scss']
})
export class SideMenuBarComponent implements OnInit {

  icons: Array<any> = [
    "abc",
    "def",
    "clgt"
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
