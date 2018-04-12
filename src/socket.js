;;
(function(){
    let config = {
        url: "ws://localhost",
        port: 8888
    };
    let global = window;
    let data; // receive data

    // handle receive message
    let receiveHandle = {
        login() {
            if(data.success === false) {
                alert("Login unsuccess,please try a different name");
            } else {
                loginPage.style.display = "none";
                callPage.style.display = "block";
                startConnection();
            }
        },
        offer() {},
        answer() {},
        candidate() {},
        leave() {}
    }
    let connection = new WebSocket(`${config.url}:${config.port}`);
    connection.onopen = () => {
        console.log("websocket connected");
    };

    connection.onmessage = message => {
        console.log(`got message ${message.data}`);
        data = JSON.parse(message.data);
        (data.type in receiveHandle) ? receiveHandle[data.type]() : '';

    };

    connection.onerror = err => {
        console.log(`got error ${err}`);
    };

    global.socket = {
        connection: connection,
        send(msg) {
            if(global.connectedUser) {
                msg.name = connectedUser;
            }
            connection.send(JSON.stringify(msg));
        },
        name: '',
    }
})();
