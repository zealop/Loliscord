import { Component } from '@angular/core';

import {SignalingService} from './services/signaling.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'loliscord';
  constructor(
    private signalingService: SignalingService,
  ) 
  {}
  ngOnInit() {
    this.signalingService.initRTC();
  }
}
