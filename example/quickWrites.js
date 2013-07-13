var swapStream = require('../.')

var options = {
  namer : namer
, swapper : swapper
, tdelta : 20
, path : "."
, fsops : {
    flags: "a"
  , encoding: "utf8"
  }
}

var ss = swapStream(options)

var iv
iv = setInterval(writeDigits(ss, 0), 1)

function namer () {
  return "t-" + getMillisecond() + "-" + getSecond()
}

function swapper () {
  return Math.floor(parseInt(getMillisecond()) / 100)
}

function getMillisecond () {
  var d = new Date()
  return ('00' + d.getMilliseconds() ).slice(-3)
}

function getSecond () {
  var d = new Date()
  return ('0' + d.getSeconds() ).slice(-2)
}

function writeDigits(ss, count) {
  return function () {
    ss.write(count++ + "\n")
    if (count === 200) {
      clearInterval(iv)
      var sum = 0
      for (var i = 0; i < 200; i++) sum += i
      console.log("sum should ==", sum)
      process.exit()
    }
  }
}
