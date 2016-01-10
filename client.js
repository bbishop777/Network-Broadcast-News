var net = require('net');

var connectionToServer = net.connect({host: 'localhost', port: 6969}, function() {
  process.stdin.setEncoding('utf8');

//client can be considered the software installed locally on your pc
//the user uses the software.  process.stdout.write is the software
//writing a message to the user (not necessarily from the server)
//process.stdout.write('==>: ');


//process.stdin is anything the user types in & once they hit enter
//it triggers the `.on 'data' event (an async process as this is a listener waiting)
  process.stdin.on('data', function(data){
    process.stdout.write('==>: ');
    //the connectionToServer.write takes the data written by user and sends
    //to the server
    connectionToServer.write(data);
  });


//connectionToServer.on is a listener waiting for 'data' to come from the server
  connectionToServer.on('data', function (data) {
//below is telling me what the server
    process.stdout.write(data);

  });
});