import { Injectable } from '@angular/core';
import { Observable, Observer } from 'rxjs';

import * as socketIo from 'socket.io-client';

const ICE_SERVERS: RTCIceServer[] = [
  {urls: ['stun:stun.example.com', 'stun:stun-1.example.com']},
  {urls: 'stun:stun.l.google.com:19302'}
];
const PEER_CONNECTION_CONFIG: RTCConfiguration = {
  iceServers: ICE_SERVERS
};
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
      this.peers.forEach((p) => p.close());
    });

    this.socket.on('addPeer', (config)  => {
      console.log('Signaling server said to add peer:', config);
      const peer_id = config.peer_id;
      const peer_connection = new RTCPeerConnection(
        PEER_CONNECTION_CONFIG                         
      );
      this.peers[peer_id] = peer_connection;
      if (config.should_create_offer) {
        console.log("Creating RTC offer to ", peer_id);
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
      var peer_id = config.peer_id;
      var peer: RTCPeerConnection = this.peers[peer_id];
      var remote_description = config.session_description;
      console.log(config.session_description);

      var desc = new RTCSessionDescription(remote_description);
      var stuff = peer.setRemoteDescription(desc)
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
      var peer = this.peers[config.peer_id];
      var ice_candidate = config.ice_candidate;
      peer.addIceCandidate(new RTCIceCandidate(ice_candidate));
    });

    this.socket.on('removePeer', (config) => {
      console.log('Signaling server said to remove peer:', config);
      var peer_id = config.peer_id;
      if (peer_id in this.peers) {
        this.peers[peer_id].close();
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
}
