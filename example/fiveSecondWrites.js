var swapStream = require('../.')
var RandomStream = require('random-stream')

var options = {
  namer : namer
, swapper : swapper
, tdelta : 1000
, path : "."
, fsops : {
    flags: "a"
  , encoding: "utf8"
  }
}

var ss = swapStream(options)

RandomStream().pipe(ss)

function namer () {
  return "t-" + getSecond() + "-" + getMinute()
}

function swapper () {
  return Math.round(parseInt(getSecond()) / 5)
}

function getMinute () {
  var d = new Date()
  return ('0' + d.getMinutes() ).slice(-2)
}

function getSecond () {
  var d = new Date()
  return ('0' + d.getSeconds() ).slice(-2)
}