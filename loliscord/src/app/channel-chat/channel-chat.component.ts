import { Component, OnInit } from '@angular/core';
import {SignalingService} from 'src/app/services/signaling.service';

@Component({
  selector: 'app-channel-chat',
  templateUrl: './channel-chat.component.html',
  styleUrls: ['./channel-chat.component.scss']
})
export class ChannelChatComponent implements OnInit {
  message: string;
  constructor(
    private signalingService: SignalingService,
  ) 
  { }

  ngOnInit(): void {
  }
  sendMessage() {
    console.log(this.message);
    this.signalingService.sendMessage(this.message);
  }
}
