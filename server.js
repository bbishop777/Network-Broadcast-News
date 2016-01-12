var net = require('net');
var fs = require('fs');
var names = require('./name.js');
var clients = [];



var Server = net.createServer(function (client) {
  client.setEncoding('utf-8');
  clients.push(client);

  client.write('Welcome! Please type in \'Username:\' followed by a space then your username\n' +
   '(if not registered, type \'Username:\' then space, and enter a new username\n' + '(include at least 3 different numbers and 5 letters)):\n' + '==>:');


  process.stdout.write('\rServer: ' + clients[clients.length-1].remotePort + ' ' + clients.length + '\n');

  process.stdin.setEncoding('utf-8');

  process.stdin.on('data', function(data){
      if (data.search(/kick/i) === 0) {
        var kickIt = data.split(' ');
        var kickThem = kickIt[1].trim();
        var kickStatus = kick(kickThem);
        if (kickStatus === true) {
          return;
        }
      } else if(client.username !== undefined) {
        console.log('NOOOOT HERREEE');
        client.write('\r[ADMIN]:' + data +'me:');
        process.stdout.write('\rServer: ');
     }
  });

  client.on('data', function (data) {
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
//Something wrong here.  Kicks them but breaks the Server
//
  function kick(kickThem) {
    for (var j = 0; j < clients.length; j++) {
      if(clients[j].username === kickThem) {
        clients[j].end('\r[ADMIN]: You have been kicked out from the Chatroom!');
        return true;
      }
    }
  }

  client.on('end', function() {
    process.stdout.write('\rServer: ' + client.username + ' disconnected\nServer: ');
    for (var i = 0; i < clients.length; i++) {
      if ((client.status !== 'bad') && (clients[i] !== client)) {
        clients[i].write('\r' + client.username +' has left the building!\nme: ');
      }
    }

    for(var z = 0; z < clients.length; z++) {
     if (clients[z] === client) {
          process.stdout.write('\rServer: Clients before disconnect: ' + clients.length + '\n');
          process.stdout.write('\rServer: Removing ' + client.remotePort + ' ' + client.username +'\n');
          clients.splice(z, 1);
          process.stdout.write('\rServer: Clients left after disconnect: ' + clients.length + '\n');
        //could record this in Server too
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