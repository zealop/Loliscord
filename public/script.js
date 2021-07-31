const times = x => f => {
  if (x > 0) {
    f()
    times (x - 1) (f)
  }
}
const scrollToBottom = (node) => {
	node.scrollTop = node.scrollHeight;
}
const SERVER_URL = "https://loliscordapi.herokuapp.com";
// const SERVER_URL = "http://192.168.1.101:8000"

const PEER_CONNECTION_CONFIG = {
  iceServers: [
    {urls: 'stun:stun.l.google.com:19302' },
  ]
};
const DEFAULT_CHANNEL_ID = 1;
var mediaConstraints = {
  audio: true, // We want an audio track
  video: false // ...and we want a video track
};
//alisasing
const sample = arr => arr[Math.floor(Math.random() * arr.length)];
const randomName = ['Harry Potter', 'Hermione Granger', 'Ron Weasly', 'Luna Lovegood', 'Albus Dumbledore', 'Draco Malfoy']
const userData = {};
// userData.name = prompt("Please enter your name", "Harry Potter");
if(!userData.name) userData.name = sample(randomName);

let localStream;

const socket = io(SERVER_URL, { transports: ["websocket"]} );


socket.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});
socket.on('connect', () => {
  console.log(`Connected to signaling server as ${socket.id}`);
  appendMessage('System', `${socket.id} (You) connected as ${userData.name}`);
  
});
socket.on('disconnect', () =>{
  console.log('Disconnected from signaling server');    
});

const peers = new Map();

socket.on('newPeer', (newPeers, polite)  => {
  console.log('Signaling server said to add new peer(s):', newPeers);

  newPeers = newPeers.filter(p => p !== socket.id);
  newPeers.forEach(async id => {
    // keep track of some negotiation state to prevent races and errors
    const tracker = {
      'makingOffer'                   : false,
      'ignoreOffer'                   : false,
      'isSettingRemoteAnswerPending'  : false,
      'polite'                        : polite,
      'isVoice'                       : false,
    };
    peers.set(id, tracker);
    //create peer conenction
    console.log(`Creating new RTC for peer: ${id}`);
    const pc = new RTCPeerConnection(PEER_CONNECTION_CONFIG);
    tracker.pc = pc;
    // send any ice candidates to the other peer
    pc.onicecandidate = (candidate) => {
      console.log(`sending ICE to ${id}`);
      socket.emit('relayICE', socket.id, id, candidate.candidate)
    };
    prepareAudio(id);
    pc.ontrack = (ev) => {
      console.log(`Received track: ${id}`);
      const wrapper = document.getElementById(id);
      const audio = wrapper.getElementsByTagName('audio')[0];
      audio.srcObject = ev.streams[0];
    };
    // let the "negotiationneeded" event trigger offer generation
    pc.onnegotiationneeded = async () => {
      try {
        tracker.makingOffer = true;
        await pc.setLocalDescription();
        console.log(`sending SDP to ${id}`);
        socket.emit('relaySDP', socket.id, id, pc.localDescription);
      } catch (err) {
         console.error(err);
      } finally {
        tracker.makingOffer = false;
      }
    };  
    //create data channel
    console.log(`Creating new DC for peer: ${id}`);
    const dc = pc.createDataChannel('default', {negotiated: true, id: DEFAULT_CHANNEL_ID});
    tracker.dc = dc;
    dc.onmessage = (event) => {
      const o = JSON.parse(event.data);
      if(o.message) {
        appendMessage(tracker.name, o.message, o.timestamp);
      }
      else {
        tracker.name = o.name;
        appendMessage('System', `${id} connected as ${o.name}`);
      }
    }
    dc.onopen = () => {
      console.log(`Data channel open: ${id}`);
      dc.send(`{"name": "${userData.name}"}`);
    };
    dc.onclose = () => console.log(`Data channel close: ${id}`);

    await joinVoice();

  });
});
socket.on('SDP', async (sender, description) => {
  console.log(`Receiving SDP from ${sender}`);
  if (description) {
    
    const peer = peers.get(sender);
    // An offer may come in while we are busy processing SRD(answer).
    // In this case, we will be in "stable" by the time the offer is processed
    // so it is safe to chain it on our Operations Chain now.
    try {
      const readyForOffer =
            !peer.makingOffer &&
            (peer.pc.signalingState == "stable" || peer.isSettingRemoteAnswerPending);
      const offerCollision = description.type == "offer" && !readyForOffer;
  
      peer.ignoreOffer = !peer.polite && offerCollision;
      if (peer.ignoreOffer) {
        return;
      }
      peer.isSettingRemoteAnswerPending = description.type == "answer";
      await peer.pc.setRemoteDescription(description); // SRD rolls back as needed
      peer.isSettingRemoteAnswerPending = false;
      if (description.type == "offer") {
        await peer.pc.setLocalDescription();
        console.log(`sending SDP to ${sender}`);
        socket.emit('relaySDP', socket.id, sender, peer.pc.localDescription)  ;
      }
    } catch (err) {
      console.error(err);
    }
  }
});

socket.on('ICE', async (sender, candidate) => {
  console.log(`Receiving ICE from ${sender}`);
  if (candidate) {  
    const peer = peers.get(sender);
    try {
      await peer.pc.addIceCandidate(candidate);
    } catch (err) {
      if (!peer.ignoreOffer) throw err; // Suppress ignored offer's candidates
    }
  }
});



function appendMessage(sender, msg, time = new Date().toLocaleString()) {
  const mess = document.getElementById('mess');
  mess.insertAdjacentHTML('beforeend', `
    <div class="col-12 m-0 p-2 border border-primary max-content">
        <div class="row fw-bold">
            <div class="col-auto">#${sender}</div>   
            <div class="col-auto">@${time}</div>                 
        </div>
        <div class="row p-2">
            <div class="col-auto breaker">${msg}</div>   
        </div>
    </div>
  `);
}
function sendMessage(message) {
  let o= {
    "message"   : message,
    "timestamp" : new Date().toLocaleString()
  }
  peers.forEach( async (peer, id) => {
    peer.dc.send(JSON.stringify(o));
  });
  appendMessage(userData.name, o.message, o.timestamp);
}


//send msg on enter
input.addEventListener('keydown',  (e) => {
  if (e.keyCode == 13 && !e.shiftKey) { 
    const input = document.getElementById('input');
    e.preventDefault();
    if(input.textContent)
    sendMessage(input.textContent);
    input.textContent = "";
    //scroll to bottom
    scrollToBottom(document.getElementById('mess'));
  }
});


socket.on('removePeer', (id) => {
  console.log(`Signaling server said to remove peer: ${id}`);
  
  const peer = peers.get(id);
  peer.pc.close();
  peer.dc.close();
  deleteAudio(id);
  appendMessage("System", `${peer.name} (${id})  left.`);

  peers.delete(id); 
});



function handleTrackEvent(event) {
  console.log('Receive track: ', event);
  for(let peer_id in peers) {
    if(peers[peer_id].RTC == event.target)
      console.log("Adding track");
      //peers[peer_id].stream.addTrack(event.track);
      trackSubject.next({
        'peer_id': peer_id,
        'track': event.track,
      });
      return;
  }
}

function prepareAudio(id) {
  const peer = peers.get(id);
  const voice = document.getElementById('voice');
  voice.insertAdjacentHTML('beforeend', `
    <div id="${id}"">
      <span>${id}</span>
      <audio controls autoplay></audio>
    </div>
  `);
}
function deleteAudio(id) {
  const wrapper = document.getElementById(id);
  wrapper.remove();
}


async function joinVoice() {
  try {
    if(!localStream)
      localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    /* use the stream */
    peers.forEach( async (peer, id) => {
      if(!peer.isVoice)
        localStream.getTracks().forEach(track => peer.pc.addTrack(track, localStream));
        
    });
  } catch(err) {
    console.log(err)
  }
}

async function leaveVoice() {
}

//toggle sidebar stuff
if(window.matchMedia('(min-width: 768px)').matches) toggleSidebar();
document.getElementById('sidebar-toggle').addEventListener('click', toggleSidebar);
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar-wrapper");
  sidebar.classList.toggle('hide');
}