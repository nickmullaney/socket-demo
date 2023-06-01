'use strict';

class Queue{
  constructor(){
    this.data = {};
  }

  store(key, value){
    this.data[key] = value;
    // No need to spy on console for test, just test the output
    console.log('Something was added to the queue');
    return key;
  }

  read(key){
    return this.data[key];
  }

  remove(key){
    console.log('Something was removed from queue');
    // Grab that value at the key
    let value = this.data[key];
    // This deletes the value at the key
    delete this.data[key];
    return value;
  }
}

module.exports = Queue;