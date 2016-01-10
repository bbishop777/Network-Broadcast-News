var net = require('net');
var clients = [];

var Server = net.createServer(function (client) {
  clients.push(client);
  console.log(clients[clients.length-1].remotePort);

  client.on('data', function (data) {
    console.log(data);
    client.write(data);
  });

  client.on('end', function() {
    console.log('Someone disconnected');
    for (var i = 0; i < clients.length; i++) {
      if (clients[i] === client) {
        console.log(clients.length);
        console.log('Removed client', client.remotePort);
        clients.splice(i, 1);
        console.log(clients.length);

      }
    }
  });


  client.setEncoding('utf-8');
  client.write('Welcome! Please type message and hit return\n');
});

Server.listen({port: 6969, host: 'localhost'}, function (){
  console.log('Server is running');

});