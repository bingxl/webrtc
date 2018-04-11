
let yourVideo = document.querySelector('#yours');
let theirVideo = document.querySelector('#theirs');
let yourConnection, theirConnection;

// Put variables in global scope to make them available to the browser console.
let constraints = window.constraints = {
  audio: false,
  video: true
};

let offerOptions = {
  offerToReceiveAudio: 0,
  offerToReceiveVideo: 1
};

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);

function handleSuccess(stream) {
//   var videoTracks = stream.getVideoTracks();
  let audioTracks = stream.getAudioTracks();
  console.log('Got stream with constraints:', constraints);
  window.stream = stream; // make variable available to browser console
  yourVideo.srcObject = stream; //add the stream to local video to show;
  startPeerConnection(stream);
}

function handleError(error) {
  console.error(error);
}

function startPeerConnection(stream) {
  console.log('start Connection function');
  let configuration = {
    // iceServers: [{url: "stun:127.0.0.1:9874"}]
  };

  yourConnection = new RTCPeerConnection(configuration);
  theirConnection = new RTCPeerConnection(configuration);

  // create ice process
  yourConnection.onicecandidate = event => {
    console.log('yourConnection ice candidate event');
    if(event.candidate) {
      theirConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  };

  theirConnection.onicecandidate = event => {
    console.log('theirConnection ice candidate event');
    if(event.candidate) {
      yourConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  };

  theirConnection.ontrack = e => {
    if(theirVideo.srcObject !== e.streams[0]) {
      theirVideo.srcObject = e.streams[0];
    }
  };

  // add track to local peerconnection
  stream.getTracks().forEach(track => {
    yourConnection.addTrack(track, stream);
  });

  // strart to offer
  yourConnection.createOffer(offerOptions).then(offer => {
    console.log('create offer');
    yourConnection.setLocalDescription(offer);
    theirConnection.setRemoteDescription(offer);

    theirConnection.createAnswer().then( answer => {
      theirConnection.setLocalDescription(answer);
      yourConnection.setRemoteDescription(answer);
      window.answer = answer;
      console.log('create answer');
    })
    window.offer = offer;
  });

}