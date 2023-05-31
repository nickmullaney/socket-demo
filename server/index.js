'use strict';

require('dotenv').config();
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3001;


// Socket server singleton(sometimes called io)
const server = new Server();

// Listening for all events on port
server.listen(PORT);

// allows the capability for clients to connect to http://localhost/3001
server.on('connection', (socket) => {
  // proof of life for connection to server
  console.log('connected to the event server', socket.id);
  socket.on('MESSAGE', (payload) => {
    // we used logger for this in lab 11, can use socketio method for logging any event
    console.log('SERVER: Message event', payload);

    // 3 ways to emit [Cheat sheet](https://socket.io/docs/v4/emit-cheatsheet/)

    // socket.emit('MESSAGE', payload); //Basic emit back to sender
    // server.emit('MESSAGE', payload); //send to all clients connected to the server
    socket.broadcast.emit('MESSAGE', payload); // sends to all parties in the socket except for the sender
  });
  socket.on('RECEIVED', (payload) => {
    console.log('SERVER: Received event', payload);
    // Note that No One is listening for this!
    socket.broadcast.emit('RECEIVED', payload);
  });
});




// Create a namespace example
// Listening for all events on port http://localhost/3001/brightness 
const brightness = server.of('/brightness');
brightness.on('connection', (socket) => {
  console.log('Socket connected to brightness namespace! ', socket.id);

  // How to join a room
  socket.on('JOIN', (room) => {
    console.log('These are the rooms', socket.adapter.rooms);
    console.log('---payload is the room name in this example---', room);
    socket.join(room);
    console.log(`You've joined the ${room} room`);
    console.log('these are All the current rooms', socket.adapter.rooms);
    // how to emit to a room: maybe useful later
    // socket.to(room)
  });
});