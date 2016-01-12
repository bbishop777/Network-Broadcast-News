var net = require('net');
var clientName = null;

var connectionToServer = net.connect({host: 'localhost', port: 6969}, function() {
  process.stdin.setEncoding('utf8');

//client can be considered the software installed locally on your pc
//the user uses the software.  process.stdout.write is the software
//writing a message to the user (not necessarily from the server)
//process.stdout.write('==>: ');


//process.stdin is anything the user types in & once they hit enter
//it triggers the `.on 'data' event (an async process as this is a listener waiting)
  process.stdin.on('data', function(data){
    if(data.search(/username:/i) >= 0) {
      var usrNameSplit = data.split(' ');
      clientName = usrNameSplit[1].trim();
      //process.stdout.write();
      connectionToServer.write(data);
    } else if(clientName === null) {
      connectionToServer.write(data);
    } else {
    //the connectionToServer.write takes the data written by user and sends
    //to the server
      // if(clientName === 'Brad777') {
      //   clientName += '\[ADMIN\]';
      // }
      connectionToServer.write(clientName + '==>: ' + data);
    }
  });


//connectionToServer.on is a listener waiting for 'data' to come from the server
  connectionToServer.on('data', function (data) {
//below is telling me what the server
    process.stdout.write(data);

  });
});