var net = require('net');
var fs = require('fs');
var names = require('./name.js');
var clients = [];

//This controls the behavior for when Server-side admin types anything
//and presses enter
//
//the first condition looks to see if Admin types kick and a username and
//initiates a process to remove the client's connection
process.stdin.on('data', function(data) {
  if (data.search(/kick/i) === 0) {
    var whosOut = data.split(' ');
    var bootThem = whosOut[1].trim();
    var kStatus = kick(bootThem);
    if (kStatus === true) {
      return;
    }
  }
  //if not kicking someone...the ADMIN broadcasts to everyone
  for(var p = 0; p < clients.length; p++) {
    if(clients[p].username !== undefined) {
      clients[p].write('\r[ADMIN]:' + data +'me:');
      process.stdout.write('\rServer: ');
    }
 }
});

//function to disconnect the client
function kick(bootThem) {
  console.log("Hereeeee");
  for (var j = 0; j < clients.length; j++) {
    if(clients[j].username === bootThem) {
      //clients[j].status = 'bad';
      clients[j].write('\r[ADMIN]: You have been removed from the Chatroom!');
      clients[j].end();
      return true;
    }
  }
}

//this timer is initiated below when client first starts typing.  If they make
//more than 10 entries in 2 seconds they are disconnected from Server
function myTimer (limitTimer, client) {
      if (client.count > 10) {
        client.write('\r[ADMIN]: You have exceeded posts per second.  You are being removed from the Chatroom!\n');
        process.stdout.write('\rServer To ' + client.username + ': You have exceeded posts per second.  You are being removed from the Chatroom!\nServer: ');
        kick(client.username);
        console.log('Im kicking ' + client.username);
        stopMyTimer(limitTimer, client);
      } else {
        console.log(client.username + ' Ok number of posts');
        stopMyTimer(limitTimer, client);
      }
    }
//this function stops the timer which is initiated in the limitTimer.  It does
//not stop the function...the function only starts a process.  The var limitTimer
//references it and is passed along from function to function.  ClearInterval finds
//the Timer process and stops it.
function stopMyTimer(limitTimer, client) {
  client.count = 0;
  hasTimer = false;
  clearInterval(limitTimer);
}

//creates instance of a server and client (when client.js is run on port 6969)
var Server = net.createServer(function (client) {
  client.setEncoding('utf-8');
  clients.push(client);
  client.count = 0;
  var hasTimer = false;

  //sends initial message to client
  client.write('Welcome! Please type in \'Username:\' followed by a space then your username\n' +
   '(if not registered, type \'Username:\' then space, and enter a new username\n' + '(include at least 3 different numbers and 5 letters)):\n' + '==>:');

  //Server to its console communication
  process.stdout.write('\rServer: ' + clients[clients.length-1].remotePort + ' ' + clients.length + '\n');

  //sets encoding Server side
  process.stdin.setEncoding('utf-8');


  //This is activated everytime a client hits enter whether they type something or not
  //
  client.on('data', function (data) {

    //checks to see if hasTimer is set to false...if it is, it starts a new one on the client.
    //This prevents a new timer being started with each post from the same client.  A new timer
    //is only started on the same client after 2 seconds with the post limit not exceeded
    if(!hasTimer) {
      var limitTimer = setInterval(function() {
        myTimer(limitTimer, client);
      }, 2000);
    }

    client.count += 1;



    if(data.search(/username:/i) === 0) {
      return registration(client, data);
    } else if (client.username === undefined) {
      client.status = 'bad';
      incorrectUsername(client);
    } else if (client.username.length > 0) {

      return post(client, data);
    }
  });

  function registration(client, data) {
    var usrNameSplit = data.split(' ');
    client.username = usrNameSplit[1].trim();
    var isAdmin = checkforAdmin(client, usrNameSplit);
    if (isAdmin === false) {
      return;
    }
    client.write('Welcome ' + client.username+ '\n');
    process.stdout.write('\rServer To ' + client.username + ': ' + 'Welcome ' + client.username+ '\n Server: ');

    if(names.indexOf(client.username) >= 0) {
      client.write(client.username + ' I see you are already registered! Welcome back.\n' + 'me:');
      process.stdout.write('\rServer To ' + client.username + ': ' + client.username + ' I see you are already registered! Welcome back.\n' + 'Server: ');
      announce(client);
    } else {
      names.push(client.username);
      var nameStage = (JSON.stringify(names));
      client.write('You are now registered!\n' + 'me: ');
      process.stdout.write('\rServer To ' + client.username + ': ' + 'You are now registered!\n' + 'Server: ');
      announce(client);
      fs.writeFileSync('./name.js', 'var name = ' + nameStage + ';\n' + 'module.exports = name;');
    }
  }

  function incorrectUsername (client) {
    client.end('Must enter a valid username to continue!  You will need to reconnect to server\n\n' +
        'Goodbye');
    return false;
  }

  function checkforAdmin(client, usrNameSplit) {
    if(usrNameSplit[1].search(/ADMIN/i) >= 0) {
      client.status = 'bad';
      client.write('Administration is already set.  You can not use that suffix!\n');
      process.stdout.write('\rServer: To ' + client.username + ': ' + 'Administration is already set.  You can not use that suffix!\nServer: ');
      return incorrectUsername(client);

    } else {
      return true;
    }
  }

  function post(client, data) {
    client.write ('me: ');
    if (data.search(/who's online/i) >= 0) {
      process.stdout.write('\r' + data + 'Server: ');
      for (var x = 0; x < clients.length; x++) {
        client.write('\r' + clients[x].username + '\nme: ');
        process.stdout.write('\rServer: To ' + client.username + ': ' + clients[x].username +'\nServer: ');
      }
      return;
    }

    process.stdout.write('\r' + data + 'Server: ');
    for (var i = 0; i < clients.length; i++) {
      if((clients[i] != client) && (clients[i].username !== undefined)) {
        clients[i].write('\r' + data + 'me: ');
        //post(client);
      }
    }
  }

  function announce(client) {
    for(var i=0; i < clients.length; i++) {
      if((clients[i] != client) && (clients[i].username !== undefined)) {
        process.stdout.write('\rServer: To ' + clients[i].username + ': ' + client.username + ' has joined the Chatroom!\nServer: ');
        clients[i].write('\r' + client.username + ' has joined the Chatroom!\nme: ');
      }
    }
  }

  client.on('end', function() {

    process.stdout.write('\rServer: ' + client.username + ' disconnected\nServer: ');
      console.log('Heeeereee?', clients.length);
    for (var i = 0; i < clients.length; i++) {
      if ((client.status !== 'bad') && (clients[i] !== client)) {
        clients[i].write('\r' + client.username +' has left the building!\nme: ');
        process.stdout.write('\rServer: To ' + clients[i].username + ': ' + client.username + ' has left the building!\nServer: ');
      }
    }

    for(var z = 0; z < clients.length; z++) {
     if (clients[z] === client) {
          process.stdout.write('\rServer: Clients before disconnect: ' + clients.length + '\n');
          process.stdout.write('\rServer: Removing ' + client.remotePort + ' ' + client.username +'\n');
          clients.splice(z, 1);
          process.stdout.write('\rServer: Clients left after disconnect: ' + clients.length + '\n');
      }
    }
    return;
  });

});

Server.listen(6969, 'localhost', function (){
  process.stdout.write('Server is running\n');

});
// Server.listen(6969, '0.0.0.0', function (){
//   console.log('Server is running');

// });