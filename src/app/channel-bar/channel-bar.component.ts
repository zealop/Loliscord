import { Component, Renderer2, OnInit, ViewChild, ElementRef } from '@angular/core';
import {SignalingService, LoliscordConnection} from 'src/app/services/signaling.service';
@Component({
  selector: 'app-channel-bar',
  templateUrl: './channel-bar.component.html',
  styleUrls: ['./channel-bar.component.scss']
})
export class ChannelBarComponent implements OnInit {

  constructor(
    private signalingService: SignalingService,
    private renderer: Renderer2,
  ) { 
  }

  stream: MediaStream = new MediaStream();

  lolis: Array<LoliscordConnection> = [];

  @ViewChild('body') body: ElementRef;
  ngOnInit(): void {
    this.signalingService.trackSubject.subscribe((event) => {
      this.lolis = [];
      for(let peer_id in event) {
        this.lolis.push(event[peer_id]);
      }
      console.log(this.lolis);
    });
   
  }
  joinVoice() {
    this.signalingService.joinVoice();
  }
  leaveVoice() {
    this.signalingService.leaveVoice();
  }
}
