'use strict';

require('dotenv').config();
const { Server } = require('socket.io');
const PORT = process.env.PORT || 3001;
const Queue = require('./lib/queue');
let messageQueue = new Queue(); 

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
    // TODO: step 1, store all messages in Queue
    let currentQueue = messageQueue.read(payload.queueId);
    // first time we run our server this queue wont exist, we need validation
    if(!currentQueue){                  // key
      let queueKey = messageQueue.store(payload.queueId, new Queue());
      currentQueue = messageQueue.read(queueKey);
    } 

    // Now that we KNOW we have a current queue, lets store the incoming message
    // Because that unique messageId is a string, Javascript will maintain order for us.
    currentQueue.store(payload.messageId, payload);

    socket.broadcast.emit('MESSAGE', payload); // sends to all parties in the socket except for the sender
  });
  socket.on('RECEIVED', (payload) => {
    console.log('SERVER: Received event', payload);
    // TODO: step 2, if the message is received, remove it from the queue
    let currentQueue = messageQueue.read(payload.queueId);
    if(!currentQueue){
      throw new Error('We have messages, but no queue');
    }
    let message = currentQueue.remove(payload.queueId);

    // Note that No One is listening for this!
    socket.broadcast.emit('RECEIVED', message);
  });

  // TODO: step 3, create an event called GET_MESSAGES that the recipient
  // TODO: can emit so that they can get any missed messages

  socket.on('GET-MESSAGES', (payload)=>{
    console.log('Attempting to get messages');
    let currentQueue = messageQueue.read(payload.queueId);
    if(currentQueue && currentQueue.data){
      // Getting a list of all messages
      Object.keys(currentQueue.data).forEach(messageId =>{
        // Sending saved messages that were missed by recipient
        // Maybe sending to the correct room also works
        socket.emit('MESSAGE', currentQueue.read(messageId));
        // Once we emit then our code should receive the messages and remove them
      });
    }
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