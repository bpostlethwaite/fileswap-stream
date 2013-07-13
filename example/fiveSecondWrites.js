var timeFileStream = require('./time-fileStream')


var options = {
  namer : namer
, timer : timer
, tdelta : 1000
, path : "."
, fsops : {
    flags: "a"
  , encoding: "utf8"
  }
}

var timeStream = timeFileStream(options)


function namer () {
  return "t-" + getSecond() + "-" + getMinute()
}

function timer () {
  Math.round(parseInt(getSecond()) / 5)
}

function getMinute () {
  var d = new Date()
  return ('0' + d.getMinutes() ).slice(-2)
}

function getSecond () {
  var d = new Date()
  return ('0' + d.getSeconds() ).slice(-2)
}