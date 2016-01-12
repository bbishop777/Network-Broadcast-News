var net = require('net');
var fs = require('fs');
var names = require('./name.js');
var clients = [];



var Server = net.createServer(function (client) {
  client.setEncoding('utf-8');
  clients.push(client);

  client.write('Welcome! Please type in \'Username:\' followed by a space then your username\n' +
   '(if not registered, type \'Username:\' then space, and enter a new username\n' + '(include at least 3 different numbers and 5 letters)):\n' + '==>:');


  process.stdout.write(clients[clients.length-1].remotePort + ' ' + clients.length + '\n');

  process.stdin.on('data', function(data){
    // for (var y = 0; y < clients.length; y++) {
      if(client.username !== undefined) {
        client.write('[ADMIN]:' + data +'\nme:');
     }
    // }
  });

  client.on('data', function (data) {
    if(data.search(/username:/i) === 0) {
      return registration(client, data);
    } else if (client.username === undefined) {
      client.username = 'bad';
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

    if(names.indexOf(client.username) >= 0) {
      client.write(client.username + ' I see you are already registered! Welcome back.\n' + 'me:');
    } else {
      names.push(client.username);
      var nameStage = (JSON.stringify(names));
      client.write('You are now registered!\n' + 'me:');
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
      client.username = 'bad';
      client.write('Administration is already set.  You can not use that suffix!\n');
      return incorrectUsername(client);

    } else {
      return true;
    }
  }

  function post(client, data) {
    client.write ('me:');
    for (var i = 0; i < clients.length; i++) {
      if((clients[i] != client) && (clients[i].username !== undefined)) {
        clients[i].write(data + '\n');
        //post(client);
      }
    }
  }



  client.on('end', function() {
    process.stdout.write('Someone disconnected\n');
    for (var i = 0; i < clients.length; i++) {
      if (clients[i] === client) {
        process.stdout.write(clients.length + '\n');
        process.stdout.write('Removing client ' + client.remotePort + client.username +'\n');
        clients.splice(i, 1);
        process.stdout.write(clients.length + '\n');
      } else if (client.username !== 'bad') {
        clients[i].write(client.username +' has left the building!\n');
      }
    }
  });

});

Server.listen(6969, 'localhost', function (){
  process.stdout.write('Server is running\n');

});
// Server.listen(6969, '0.0.0.0', function (){
//   console.log('Server is running');

// });