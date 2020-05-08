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

  lolis: Array<any> =  [];
  id_list: Array<any> = []

  @ViewChild('body') body: ElementRef;
  ngOnInit(): void {
      this.signalingService.trackSubject.subscribe((event) => {
        console.log(event);
        if(!this.id_list.includes(event.peer_id))
          this.lolis.push(new MediaStream([event.track]));
        console.log(this.lolis);
    });
   
  }
  async joinVoice() {
    const  localStream: MediaStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});
    const localTrack: MediaStreamTrack = localStream.getAudioTracks()[0];
    this.signalingService.joinVoice(localTrack);
  }
  leaveVoice() {
    this.signalingService.leaveVoice();
  }
}
