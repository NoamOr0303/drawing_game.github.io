const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];
let theme = '';
let drawings = [];

io.on('connection', (socket) => {
    console.log('New player connected:', socket.id);

    socket.on('joinGame', (playerName) => {
        players.push({ id: socket.id, name: playerName });
        io.emit('updatePlayers', players);
        if (players.length >= 2) {
            io.emit('startThemeSelection', players[Math.floor(Math.random() * players.length)].id);
        }
    });

    socket.on('submitTheme', (submittedTheme) => {
        theme = submittedTheme;
        io.emit('startDrawing', theme);
    });

    socket.on('submitDrawing', (drawing) => {
        drawings.push({ id: socket.id, drawing });
        if (drawings.length === players.length) {
            io.emit('showRankings', drawings);
        }
    });

    socket.on('disconnect', () => {
        players = players.filter(player => player.id !== socket.id);
        drawings = drawings.filter(drawing => drawing.id !== socket.id);
        io.emit('updatePlayers', players);
    });
});

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
