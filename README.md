# fileswap-stream

Write to a writable file-stream that swaps out it's underlying file resources according to swapper and naming functions. This can be used for a persistent log stream - just stream to it 24/7 and let it swap out to new files whenever you trigger it to.

## Example
```javascript
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
```
this will produce the files full of random junk

```shell
t-27-07  t-28-07  t-33-07  t-38-07  t-43-07
```
every five seconds as determined by `swapper`.

Other useful ideas for `swapper` would be function that returns a different value every day:
```javascript
function swapper () {
  var d = new Date()
  return ('0' + d.getUTCDate() ).slice(-2)
}
```

Another way to think about `swapper` is that it is a function that is repeatedly called to check it's return value against the last value. When the return value changes, the underlying file resource being written to is swapped out with a new name given by `namer`. In this way the fileswap could be controlled by anything, such as time, network or CPU heat.

## Options
The options object has the following fields

### options.namer
Called to name the new file. This function is called everytime the internal swapper is triggered. The function should return a string.

### options.swapper
Called every `tdelta` milliseconds and compared to the previous return value of `swapper`. If it is different, a new file resource is contructed with name supplied by `namer`.

### options.tdelta
The delay time for checking the `swapper` states.

### options.path
Optional path parameter for creating new files.

### options.fsops
options passed to `fs.createWriteStream(fsops)`

## Install
```shell
npm install swapfile-stream
```

### License
MIT
