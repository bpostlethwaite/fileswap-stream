/*
 * fileswap-stream
 * Ben Postlethwaite
 * 2013 MIT
 */
var Writable = require('stream').Writable
  , fs = require('fs')


var _write = function(chunk, encoding, callback) {

  this.sink.write(chunk)

  callback()
}

/*
 * Create a new sink when swapper carries over
 * Check time every tdelta milliseconds
 */
function setSink (fops, path) {

  if (!path)
    path = '.'

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

function sinkSwapper (swapper, tdelta, namefn) {

  var self = this
  var lastValue = swapper()

  return setInterval(
    function () {
      if (lastValue !== swapper()) {
        self.setSink( namefn() )
        lastValue = swapper()
      }
    }, tdelta)
}

module.exports = function (o) {

  var s = new Writable()
  s._write = _write
  s.setSink = setSink(o.fops, o.path)
  s.setSink( o.namer() )

  sinkSwapper = sinkSwapper.bind(s)
  s.iv = sinkSwapper(o.swapper, o.tdelta, o.namer)

  s.on('close', function () {
    clearInterval(s.iv)
  })

  return s
}

