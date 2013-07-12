var Writable = require('stream').Writable
  , fs = require('fs')


var _write = function(chunk, encoding, callback) {

  this.sink.write(chunk)

  callback()
}

/*
 * Create a new sink when timer carries over
 * Check time every tdelta milliseconds
 */
function setSink (fops, path) {

  if (!path)
    path = ''

  return function (fname) {

    var self = this

    var oldSink = self.sink

    var newSink = fs.createWriteStream(path + '/' + fname, fops)

    newSink.on('open', function () {
      self.sink = newSink
      if (oldSink && oldSink.close)
        oldSink.close()
    })

  }

}

function sinkTimer (timer, tdelta, namefn) {

  var self = this
  var time = timer()

  return setInterval(
    function () {
      if (time !== timer()) {
        self.setSink( namefn() )
        time = timer()
      }
    }, tdelta)
}

module.exports = function (o) {

  var s = new Writable()
  s._write = _write
  s.setSink = setSink(o.fops, o.path)
  s.setSink( o.namer() )

  sinkTimer = sinkTimer.bind(s)
  s.iv = sinkTimer(o.timer, o.tdelta, o.namer)

  s.on('close', function () {
    clearInterval(s.iv)
  })

  return s
}

