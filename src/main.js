//1. socket handle
let connection, name, connectedUser, data;

// handle receive message
let receiveHandle = {
  login() {
    if (data.success === false) {
      alert("Login unsuccess,please try a different name");
    } else {
      loginPage.style.display = "none";
      callPage.style.display = "block";
      startConnection();
    }
  },
  offer(offer = data.offer, othername = data.name) {
    trace("receive offer", data);
    connectedUser = othername;
    yourConnection.setRemoteDescription(offer);
    yourConnection.createAnswer()
      .then(answer => {
        trace("success to create answer");
        yourConnection.setLocalDescription(answer);
        socket.send({ type: 'answer', answer: answer, name: connectedUser });
      })
      .catch(err => {
        trace("error to create answer");
      });


  },
  answer(answer = data.answer) {
    yourConnection.setRemoteDescription(answer);

  },
  candidate(candidate = data.candidate) {
    yourConnection.addIceCandidate(new RTCIceCandidate(candidate));
    addTrack();
  },
  leave() {
    connectedUser = null;
    theirVideo.srcObject = null;
    yourConnection.close();
    yourConnection.onicecandidate = null;
    yourConnection.ontrack = null; setupPeerConnection(stream);
  }
};

let socket = {
  init() {
    let config = {
      url: `wss://cloud.bingxl.cn`,
      port: 8888
    };
    connection = new WebSocket(`${config.url}:${config.port}`);
    connection.onopen = () => {
      trace("websocket connected");
    };

    connection.onmessage = message => {
      trace(`got message ${message.data}`);
      data = JSON.parse(message.data);
      (data.type in receiveHandle) ? receiveHandle[data.type]() : '';

    };

    connection.onerror = err => {
      trace(`got error ${err}`);
    };
  },
  send(msg) {
    if (connectedUser) {
      msg.name = connectedUser;
    }
    connection.send(JSON.stringify(msg));
  },
}

socket.init();


// 2. dom handle
let loginPage = document.querySelector("#login-page");
let usernameInput = document.querySelector("#username");
let loginButton = document.querySelector("#login");
let callPage = document.querySelector("#call-page");
let theirUsernameInput = document.querySelector("#their-username");
let callButton = document.querySelector("#call");
let hangUpButton = document.querySelector("#hang-up");

callPage.style.display = "none";

loginButton.addEventListener("click", event => {
  name = usernameInput.value;

  if (name.length > 0) {
    socket.send({ type: 'login', name: name });
  } else {
    trace("send login is error, username is null");
  }
});

callButton.addEventListener('click', () => {
  trace("call button handle");
  let theirUsername = theirUsernameInput.value;
  if (theirUsername.length > 0) {
    startPeerConnection(theirUsername);
  } else {
    trace('theirUserName in null');
  }
});

hangUpButton.addEventListener('click', () => {
  socket.send({ type: 'leave' });
  receiveHandle.leave();
})


//3. webRTC handle

let yourVideo = document.querySelector('#yours');
let theirVideo = document.querySelector('#theirs');
let yourConnection, theirConnection, stream;

// Put variables in global scope to make them available to the browser console.
let constraints = window.constraints = {
  audio: false,
  video: true
};

let offerOptions = {
  offerToReceiveAudio: 0,
  offerToReceiveVideo: 1
};

function startConnection() {
  navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);
}


function handleSuccess(stream) {
  //   var videoTracks = stream.getVideoTracks();
  let audioTracks = stream.getAudioTracks();
  trace('Got stream with constraints:', constraints);
  window.stream = stream; // make variable available to browser console
  yourVideo.srcObject = stream; //add the stream to local video to show;
  setupPeerConnection(stream);
}

function handleError(error) {
  console.error("error to get local stream", error);
}

function setupPeerConnection(stream) {
  let configuration = {
    "iceServers": [{ "url": "stun:61.141.200.149:11480" }]
  };
  yourConnection = new RTCPeerConnection(configuration);

  yourConnection.ontrack = e => {
    trace("triger add track event", e);
    theirVideo.srcObject = e.stream;;
  };

  yourConnection.onicecandidate = event => {
    trace('icecandidate');
    if (event.candidate) {
      socket.send({ type: 'candidate', candidate: event.candidate });
    }
  }
}


function startPeerConnection(user) {
  trace('start PeerConnection function');
  connectedUser = user;
  // strart to offer
  yourConnection.createOffer(offerOptions)
    .then(offer => {
      trace('create offer success');
      socket.send({ type: 'offer', offer: offer });
      yourConnection.setLocalDescription(offer);
    })
    .catch(e => {
      trace("error to create offer", offer);
    })

}

function addTrack() {
   // add track to local peerconnection
  window.stream.getTracks().forEach(track => {
    yourConnection.addTrack(track, stream);
  });
}



let info = document.querySelector("#info");
let p = document.createElement('p');
function trace(...msgs) {
  console.log(msgs);

  info.appendChild(p);

  let dom = '';
  msgs.forEach(msg => {
    dom += `<span> ${msg} </span>`;
  });
  info.lastChild.innerHTML = dom + "<br>";
}