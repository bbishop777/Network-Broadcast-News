var net = require('net');
var fs = require('fs');
var names = require('./name.js');
var clients = [];


var Server = net.createServer(function (client) {
  client.setEncoding('utf-8');
  clients.push(client);

  client.write('Welcome! Please type in \'Username:\' followed by a space then your username\n' +
   '(if not registered, type \'Username:\' then space, and enter a new username):\n' + '==>:');


  //clients[clients.length-1].username = null;
  console.log(clients[clients.length-1].remotePort);

  client.on('data', function (data) {
    if(data.search(/username:/i) >= 0) {
      return registration(client, data);
    } else { //could do client.destroy here if they don't put in username.  If they do
    //then have the registration function call another function with the lines below
    //for posting
      for (var i = 0; i < clients.length; i++) {
        if(clients[i] !== client) {
          // console.log(data);
          clients[i].write(data);
        }
      }
    }
  });

  function registration(client, data) {
    var usrNameSplit = data.split(' ');
    client.username = usrNameSplit[1];
    client.write('Welcome ' + client.username);
    if(names.indexOf(client.username) >= 0) {
      client.write(client.username + ' I see you are already registered! Welcome back.\n');
    } else {
      names.push(client.username);
      names = (JSON.stringify(names));
      fs.writeFileSync('./name.js', 'var name = ' + names + ';\n' + 'module.exports = name;');
    }

  }



  client.on('end', function() {
    console.log('Someone disconnected');
    for (var i = 0; i < clients.length; i++) {
      if (clients[i] === client) {
        console.log(clients.length);
        console.log('Removing client', client.remotePort);
        clients.splice(i, 1);
        console.log(clients.length);

      }
    }
  });

//   function registration(client) {
//     client.write('Enter your username if you have registered. If not registered hit enter');
//     client.on('data', function(data) {
//       console.log('At the registration', data);
//     });

//     client.write('Please register by entering a username:\n');
//   }

});

Server.listen(6969, 'localhost', function (){
  console.log('Server is running');

});
// Server.listen(6969, '0.0.0.0', function (){
//   console.log('Server is running');

// });