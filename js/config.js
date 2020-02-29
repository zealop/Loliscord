 /** CONFIG **/
 var SIGNALING_SERVER = "https://loliscordapi.herokuapp.com";
 var USE_AUDIO = true;
 var USE_VIDEO = true;
 var DEFAULT_CHANNEL = 'some-global-channel-name';
 var MUTE_AUDIO_BY_DEFAULT = false;

 /** You should probably use a different stun server doing commercial stuff **/
 /** Also see: https://gist.github.com/zziuni/3741933 **/
 var ICE_SERVERS = [
     {url:"stun:stun.l.google.com:19302"}
 ];