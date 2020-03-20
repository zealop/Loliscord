import { Component, OnInit } from '@angular/core';
import {UserAvatar} from '../userAvatar';

@Component({
  selector: 'app-online-board',
  templateUrl: './online-board.component.html',
  styleUrls: ['./online-board.component.scss']
})
export class OnlineBoardComponent implements OnInit {

  userAvatar: UserAvatar[] = [
    {userName: "DC1", userIcon: "1"},
    {userName: "DC2", userIcon: "2"},
    {userName: "DC3", userIcon: "3"},
    {userName: "DC4", userIcon: "4"},
  ]
  constructor() { }

  ngOnInit(): void {
  }

}
