import { Injectable, Input, ɵCompiler_compileModuleSync__POST_R3__ } from '@angular/core';
import { Observable, Observer, Subject, ObjectUnsubscribedError, BehaviorSubject } from 'rxjs';

import * as socketIo from 'socket.io-client';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302' },
  ]
};
const SERVER_URL = "https://loliscordapi.herokuapp.com";
// const SERVER_URL = "http://localhost:8000"
const DEFAULT_CHANNEL = 'some-global-channel-name';
export class LoliscordConnection {
  userData: object;
  RTC: RTCPeerConnection;
  dataChannel: RTCDataChannel;
  stream: MediaStream;
}

@Injectable({
  providedIn: 'root'
})

export class SignalingService {
  currentUser: string;
  private socket: any;

  private peers: object = {};

  private dataChannels: any = {};

  public userData: any = {};

  public isVoiceCalling: boolean = false;

  public msgSubject: Subject<MessageEvent>= new Subject<MessageEvent>();
  public trackSubject: Subject<object> = new Subject<object>();



  constructor() { 
  }
  initRTC() {
    this.socket = socketIo(SERVER_URL);
    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      this.joinChannel(DEFAULT_CHANNEL, this.userData);
    });

    this.socket.on('disconnect', () =>{
      console.log('Disconnected from signaling server');
      for (let peer_id in this.peers) {
        this.peers[peer_id].RTC.close();
    }
    });

    this.socket.on('addPeer', async (config)  => {
      console.log('Signaling server said to add peer:', config);
      const peer_id = config.peer_id;
      const userData = config.userData;
      //create peer connection
      const peer_connection = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
  
      const loli_connection: LoliscordConnection = {
        userData: userData,
        RTC: peer_connection,
        dataChannel: null,
        stream: null,
      };
      //on track(voice/video) event handler
      peer_connection.ontrack = this.handleReceivedTrack;
      this.peers[peer_id] = loli_connection;
      
      console.log(this.peers);
      if(this.isVoiceCalling) {
        const localStream: MediaStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});

        for(const track of localStream.getTracks()) {
          peer_connection.addTrack(track, localStream);
        }
      }

      peer_connection.onnegotiationneeded = () => {
        if(config.should_create_offer) {
          console.log("Renegotiation needed");
          peer_connection.createOffer()
            .then((description) => {
              console.log("description is: ", description);
              peer_connection.setLocalDescription(description)
                .then( () => {
                  this.socket.emit('relaySessionDescription', {'peer_id': peer_id, 'session_description': description});
                  console.log("Offer setLocalDescription succeeded"); 
                })
                .catch((err) => console.log("Offer setLocalDescription failed!", err));
              
            })
            .catch((err) => console.log("Error sending offer: ", err));
        }
      };

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
        this.peers[peer_id].dataChannel = channel;
        console.log("Creating initial RTC offer to ", peer_id);
        peer_connection.createOffer()
          .then((description) => {
            console.log("description is: ", description);
            peer_connection.setLocalDescription(description)
              .then( () => {
                this.socket.emit('relaySessionDescription', {'peer_id': peer_id, 'session_description': description});
                console.log("Offer setLocalDescription succeeded"); 
              })
              .catch((err) => console.log("Offer setLocalDescription failed!", err));
            
          })
          .catch((err) => console.log("Error sending offer: ", err));
      }
     
      
    });

    this.socket.on('sessionDescription', (config)  => {
      console.log('Remote description received: ', config);
      const peer_id = config.peer_id;
      const peer: RTCPeerConnection = this.peers[peer_id].RTC;
      const remote_description = config.session_description;
      console.log(config.session_description);
      peer.ondatachannel = (event) => {
        console.log('Data channel connected', event.channel);
        const receiveChannel = event.channel;
        receiveChannel.onopen = () =>  receiveChannel.send('CONNECTED');
        receiveChannel.onmessage = this.handleReceivedMessage;
        this.peers[peer_id].dataChannel = receiveChannel;
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
      const peer = this.peers[config.peer_id].RTC;
      const ice_candidate = config.ice_candidate;
      peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
    });

    this.socket.on('removePeer', (config) => {
      console.log('Signaling server said to remove peer:', config);
      const peer_id = config.peer_id;
      if (peer_id in this.peers) {
        this.peers[peer_id].RTC.close();
        this.peers[peer_id].dataChannel.close();
      }

      delete this.peers[peer_id];
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
    for(let peer_id in this.peers) {
      if(this.peers[peer_id].dataChannel.readyState == 'open')
        this.peers[peer_id].dataChannel.send(message); 
    }
  }
  handleReceivedMessage = (event: MessageEvent) => {
    this.msgSubject.next(event);
  }
  handleReceivedTrack = (event: RTCTrackEvent) => {
    console.log('Receive track: ', event);
    for(let peer_id in this.peers) {
      if(this.peers[peer_id].RTC == event.target)
        console.log("Adding stream");
        this.peers[peer_id].stream = event.streams[0];
        console.log(this.peers[peer_id]);
        this.trackSubject.next(this.peers);
        return;
    }
    
  }
  async joinVoice() {
    console.log("starting join voice");
    const  localStream: MediaStream = await navigator.mediaDevices.getUserMedia({video: false, audio: true});   
    console.log("Got local stream", localStream);
    this.isVoiceCalling = true;
    for(const track of localStream.getTracks()) {
      for(let peer_id in this.peers) {
        console.log("Adding track: ", track, "to Peer: ", peer_id);
        this.peers[peer_id].RTC.addTrack(track, localStream);
      }
    }
  }
  async leaveVoice() {
    this.isVoiceCalling = false;
  }

  setUserData(userData) {
    this.userData = userData; 
  }
}