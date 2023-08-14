const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const ejs = require('ejs');
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
app.set('view engine', 'ejs');
const path = require('path');
app.use(express.static(path.join('views')));


const chatNamespace = io.of('/chat');
const chat2 = io.of('/chat/2');
let users = 0
let chat1user = 0;
let chat2user = 0;

io.on('connection', mainsoket => {
    console.log('main conneted');
    io.emit('soketuser', users);
});

chatNamespace.on('connection', socket => {
    console.log('A new client has chat-1 connected.');
    users++;
    chat1user++;

    let username;
    socket.on('set_username', (name) => {
        username = name;
    });
    chatNamespace.emit('user count', chat1user);

    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', { message: `${username}:${msg}` });
    });

    socket.on('disconnect', () => {
        chat1user--;
        users--;
        io.emit('user count', chat1user);
    })
});

chat2.on('connection', socket2 => {
    console.log('A new client has chat-2 connected.');
    users++;
    chat2user++;
    chat2.emit('user count', chat2user);

    socket2.on('chat message', (msg) => {
        socket2.broadcast.emit('chat message', msg);
    });

    socket2.on('disconnect', () => {
        users--;
        chat2user--;
        io.emit('user count', chat2user);
    })
});

const PORT = 3000;

app.get('/index', (req, res) => {
    res.render('index');
})
app.get('/index-2', (req, res) => {
    res.render('chat_2');
})
server.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}.`);
});