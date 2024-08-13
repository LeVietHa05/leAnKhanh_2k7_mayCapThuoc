
const fs = require('fs');

const option = {
    allowEIO3: true,
    cors: {
        origin: "*",
        cors_allowed_origins: "*",
        methods: ["GET", "POST"],
        transports: ["websocket", "polling"],
        credentials: true,
    },
}

const io = require("socket.io")(option);

const socketapi = {
    io: io
}

let user = JSON.parse(fs.readFileSync('user.json', 'utf8'));
//watch changes in user.json
fs.watchFile('user.json', (curr, prev) => {
    console.log("user.json changed");
    user = JSON.parse(fs.readFileSync('user.json', 'utf8'));
})

io.on("connection", (socket) => {
    console.log("[INFO] new connection: [" + socket.id + "]");
    socket.on("/esp/got-person", (data) => {
        console.log(`message from ${data.clientID ? data.clientID : 'esp'} via socket id: ${socket.id} on topic message`);
        socket.broadcast.emit("message", data);
    });

    socket.on('/esp/measure', (data) => {
        console.log(`message from ${data.clientID ? data.clientID : 'esp'} via socket id: ${socket.id} on topic /esp/measure`);
        socket.broadcast.emit('/web/measure', data);
    })

    socket.on("/esp/new-card-found", (data) => {
        console.log(`message from ${data.clientID ? data.clientID : 'esp'} via socket id: ${socket.id} on topic /esp/new-card-found`);
        console.log(data);
        let user = getUser(data.uid);
        if (user) {
            let stringToSend = getStringToSend(user);
            console.log(stringToSend);
            io.emit("/esp/new-card-found-done", { stringToSend: stringToSend });
        } else {
            console.log("User not found");
        }
    })

    socket.on("/web/control", (data) => {
        console.log(`message from ${data.clientID ? data.clientID : 'esp'} via socket id: ${socket.id} on topic /web/control`);
        console.log(data);
        socket.broadcast.emit("/esp/control", data);
    });

    socket.on("esp/other", (data) => {
        console.log(`message from ${data.clientID ? data.clientID : 'esp'} via socket id: ${socket.id} on topic esp/other`);
        socket.broadcast.emit("web/other", data);
        console.log(data);
    });
    /**************************** */
    //xu ly chung
    socket.on("reconnect", function () {
        console.log("[" + socket.id + "] reconnect.");
    });
    socket.on("disconnect", () => {
        console.log("[" + socket.id + "] disconnect.");
    });
    socket.on("connect_error", (err) => {
        console.log(err.stack);
    });
})


function getUser(uid) {
    for (let i = 0; i < user.length; i++) {
        if (+user[i].uid === +uid) {
            return user[i];
        }
    }
    return null
}
function getStringToSend(user) {
    return user.numofdrugs.join(',');
}
module.exports = socketapi;