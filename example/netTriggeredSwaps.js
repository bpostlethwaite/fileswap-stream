var swapStream = require('../.')
  , RandomStream = require('random-stream')
  , net = require('net')

var name = "name-0"
  , swap = 0


function namer () {
  return name
}

function swapper () {
  return swap
}


var options = {
  namer : namer
, swapper : swapper
, tdelta : 250
, path : "."
, fsops : {
    flags: "a"
  , encoding: "utf8"
  }
}

var ss = swapStream(options)
var rs = RandomStream({min:50, max:100})

rs.pipe(ss)


function connectClient () {
  /*
   * Update the swapper and namer return values
   */
  var client = net.connect(8124)
  client.on('data', function(data) {
    data = JSON.parse(data.toString())
    name = data.name
    swap = data.swap
    console.log(name, swap)
  })
  client.on('close', function () {
    process.exit()
  })
}


/*
 * Server in a galaxy far far away
 */
var server = net.createServer(
  function(c) {

    var data = {}
      , count = 0
    data.name = "name-"+count
    data.swap = 0
    c.pipe(c)

    var iv = setInterval(

      function () {
        if (data.swap) data.swap = 0
        else data.swap = 1
        data.name = "name-"+count
        c.write(JSON.stringify(data))
        count++

        if (count > 5) {
          clearInterval(iv)
          c.end()
          server.close()
        }

      }, 1000)
  }).listen(8124).on('listening', connectClient )