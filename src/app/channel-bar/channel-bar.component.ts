import { Component, OnInit } from '@angular/core';
import {SignalingService} from 'src/app/services/signaling.service';
@Component({
  selector: 'app-channel-bar',
  templateUrl: './channel-bar.component.html',
  styleUrls: ['./channel-bar.component.scss']
})
export class ChannelBarComponent implements OnInit {

  constructor(
    private signalingService: SignalingService,
  ) { 
  }

  ngOnInit(): void {
    this.signalingService.trackSubject.subscribe((event) => {
      console.log(event);
    });
  }
  joinVoice() {
    this.signalingService.joinVoice();
  }
}
