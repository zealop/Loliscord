import { Component, Renderer2, OnInit, ViewChild, ElementRef } from '@angular/core';
import {SignalingService} from 'src/app/services/signaling.service';
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

  @ViewChild('body') body: ElementRef;
  ngOnInit(): void {
    this.signalingService.trackSubject.subscribe((event) => {
      console.log("Track Subject", event);
      this.stream.addTrack(event.track);
    });
  }
  joinVoice() {
    this.signalingService.joinVoice();
  }
}
