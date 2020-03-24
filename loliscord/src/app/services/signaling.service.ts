import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import * as socketIo from 'socket.io-client';

//const SERVER_URL = "https://loliscordapi.herokuapp.com";
const SERVER_URL = "http://localhost:8000"
const DEFAULT_CHANNEL = 'some-global-channel-name';
const userData = {
  placeholder: 'placeholder',
}
@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private socket;
  private peers: any = [];

  constructor() { 
    this.socket = socketIo(SERVER_URL);
  }
  initRTC() {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.joinChannel(DEFAULT_CHANNEL, userData);
    });

    this.socket.on('disconnect', () =>{
      console.log('Disconnected from signaling server');
    });

    this.socket.on('test', (test) => {
      console.log(test);
    });

  }
  joinChannel(channelName, data) {
    this.socket.emit('join', {
      channel: channelName,
      userData: data,
    });
  }
}
