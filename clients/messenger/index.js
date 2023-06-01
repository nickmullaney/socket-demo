'use strict';
const { io } = require('socket.io-client');
const socket = io('http://localhost:3001');
const Chance = require('chance');
let chance = new Chance();

setInterval(() => {
  let payload = {
    text: `Hello ${chance.first()}`,
    messageId: chance.guid(),
    queueId: 'messages',
  };
  console.log(`Messenger: Message sent ${payload.text}`);
  socket.emit('MESSAGE', payload);
}, 5000);
