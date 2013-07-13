# fileswap-stream

Write to a writable file-stream that swaps out it's underlying file resources according to swapper and naming functions. This can be used for a persistent log or data stream - just stream to it 24/7 and let it swap out to new files whenever you trigger it to.

Under-the-hood the function `swapper` is repeatedly called every `tdelta` milliseconds and its return value is checked against the previous value. When the return value changes, the underlying file resource being written to is swapped out with a new name given by `namer`. In this way the fileswap could be controlled by anything, such as time, network or CPU heat. So long as the function is `swapper` syncronous! Though, async functionality can be added.


## Example 1 - normal operation
```javascript
var swapStream = require('../.')
var RandomStream = require('random-stream')

var options = {
  namer : namer
, swapper : swapper
, tdelta : 1000 // in milliseconds
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
  return Math.floor(parseInt(getSecond()) / 5)
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
t-23-07  t-28-07  t-33-07  t-38-07  t-43-07
```
every five seconds as determined by `swapper`.

Other useful ideas for `swapper` would be a function that returns a different value every day:
```javascript
function swapper () {
  var d = new Date()
  return d.getUTCDate()
}
```

## Example 2 - Fast Swap
Here the rates are juiced so that `tdelta`, the rate we compare `swapper` values, is set for 20 milliseconds. `swapper` is set to change the underlying file resource every 100 milliseconds and writes are made every millisecond. A numerical series is written to the files and summed. This sum should `==` the sum actually written to disk.

```javascript
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
```
which outputs
```shell
sum should == 19900
```
then doing a:
```shell
>>cat t* | awk '{ sum+=$1} END {print sum}'
```
gives
```
19900
```

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
npm install fileswap-stream
```

### License
MIT
