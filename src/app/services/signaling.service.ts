import { Injectable } from '@angular/core';
import { Observable, Observer, Subject } from 'rxjs';

import * as socketIo from 'socket.io-client';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302' },
  ]
};
const SERVER_URL = "https://loliscordapi.herokuapp.com";
//const SERVER_URL = "http://localhost:8000"
const DEFAULT_CHANNEL = 'some-global-channel-name';
const userData = {
  placeholder: 'placeholder',
}
@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private socket = socketIo(SERVER_URL);
  private peers: any = {};
  private peersVoice: any = {}
  private dataChannels: any = {};

  public msgSubject: Subject<MessageEvent>= new Subject<MessageEvent>();
  public trackSubject: Subject<any> = new Subject<any>();
  constructor() { 
  }
  initRTC() {
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.joinChannel(DEFAULT_CHANNEL, userData);
    });

    this.socket.on('disconnect', () =>{
      console.log('Disconnected from signaling server');
      for (let peer_id in this.peers) {
        this.peers[peer_id].close();
    }
    });

    this.socket.on('addPeer', (config)  => {
      console.log('Signaling server said to add peer:', config);
      const peer_id = config.peer_id;
      //create peer connection
      const peer_connection = new RTCPeerConnection(
        PEER_CONNECTION_CONFIG                         
      );
      //on track(voice/video) event handler
      peer_connection.ontrack = this.handleReceivedTrack;
      this.peers[peer_id] = peer_connection;
      peer_connection.onicecandidate = (event) => {
        if (event.candidate) {
            this.socket.emit('relayICECandidate', {
                'peer_id': peer_id, 
                'ice_candidate': {
                    'sdpMLineIndex': event.candidate.sdpMLineIndex,
                    'candidate': event.candidate.candidate
                }
            });
        }
      }

      if (config.should_create_offer) {
        console.log("Creating data channel to ", peer_id);
        const channel = peer_connection.createDataChannel("chat");
        channel.onopen = (event) => {
          console.log('Data channel open', event);
          channel.send('CONNECTED');
        }
        channel.onmessage = this.handleReceivedMessage;
        this.dataChannels[peer_id] = channel;
        console.log("Creating RTC offer to ", peer_id);
        peer_connection.createOffer()
          .then((description) => {
            console.log("description is: ", description);
            peer_connection.setLocalDescription(description)
              .then( () => {
                this.socket.emit('relaySessionDescription', {'peer_id': peer_id, 'session_description': description});
                console.log("Offer setLocalDescription succeeded"); 
                console.log(channel);
              })
              .catch((err) => console.log("Offer setLocalDescription failed!", err));
            
          })
          .catch((err) => console.log("Error sending offer: ", err));
      }
     
      
    });

    this.socket.on('sessionDescription', (config)  => {
      console.log('Remote description received: ', config);
      const peer_id = config.peer_id;
      const peer: RTCPeerConnection = this.peers[peer_id];
      const remote_description = config.session_description;
      console.log(config.session_description);
      peer.ondatachannel = (event) => {
        console.log('Data channel connected', event.channel);
        const receiveChannel = event.channel;
        receiveChannel.onopen = () =>  receiveChannel.send('CONNECTED');
        receiveChannel.onmessage = this.handleReceivedMessage;
        this.dataChannels[peer_id] = receiveChannel;
      }
      const desc = new RTCSessionDescription(remote_description);
      peer.setRemoteDescription(desc)
        .then(() => {
          console.log("setRemoteDescription succeeded");
          if (remote_description.type == "offer") {
            console.log("Creating answer");
            peer.createAnswer()
              .then((description) => {
                console.log("Answer description is: ", description);
                peer.setLocalDescription(description)
                    .then( () => { 
                      this.socket.emit('relaySessionDescription', {'peer_id': peer_id, 'session_description': description});
                      console.log("Answer setLocalDescription succeeded");
                      
                    })
                    .catch( (err) => { 
                      console.log("Answer setLocalDescription failed!", err)
                    });
              })
                .catch((error) => {
                  console.log("Error creating answer: ", error);
                  console.log(peer);
                });
              }
        })
        .catch((error) => {
          console.log("setRemoteDescription error: ", error);
        }
      );
      console.log("Description Object: ", desc);
    });

    this.socket.on('iceCandidate', (config) => {
      const peer = this.peers[config.peer_id];
      const ice_candidate = config.ice_candidate;
      peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
    });

    this.socket.on('removePeer', (config) => {
      console.log('Signaling server said to remove peer:', config);
      const peer_id = config.peer_id;
      if (peer_id in this.peers) {
        this.peers[peer_id].close();
      }
      if (peer_id in this.dataChannels) {
        this.dataChannels[peer_id].close();
      }
      delete this.peers[peer_id];
      delete this.dataChannels[peer_id];
    });

  }
  joinChannel(channelName, data) {
    this.socket.emit('join', {
      channel: channelName,
      userData: data,
    });
  }
  leaveChannel(channel) {
    this.socket.emit('part', channel);
  }
  sendMessage(message: string) {
    for(const peer_id in this.dataChannels) {
      if(this.dataChannels[peer_id].readyState == 'open')
        this.dataChannels[peer_id].send(message); 
    }
  }
  handleReceivedMessage = (event: MessageEvent) => {
    this.msgSubject.next(event);
  }
  handleReceivedTrack = (event: RTCTrackEvent) => {
    console.log('receive track: ', event);
    this.trackSubject.next(event);
  }
  async joinVoice() {
    const localStream: MediaStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});
    console.log(localStream)

    for(const track of localStream.getTracks()) {
      for(const peer_id in this.dataChannels) {
        this.peers[peer_id].addTrack(track); 
      }
    }
    console.log('Done join voice');
  }
}