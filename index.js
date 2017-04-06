/* eslint-env node */

var noQuiet = process.argv.some(function (arg) {
  return arg === '--no-quiet' ||
    arg === '--noq' ||
    arg === 'watch' ||
    arg === '--verbose' ||
    arg === '-v';
});

var writeAPeriod = true;
var originalWrite;

function showDots(value) {
   writeAPeriod = value;
}

function passthroughWrite( /* arguments */ ) {
   if (originalWrite) {
      originalWrite.apply(undefined, arguments);
   } else {
      process.stdout.write.apply(process.stdout, arguments)
   }
}

if (!noQuiet) {
  var output = '';
  var originalExit = process.exit;

  // Replace the original write with our own
  originalWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write = function () {
    if (writeAPeriod) {
      originalWrite('.');
    }
    // originalWrite.apply(1, arguments);
    output += Array.prototype.join.call(arguments, '');
  };

  // See https://github.com/sindresorhus/time-grunt and
  // https://github.com/cowboy/node-exit/issues/4
  // https://github.com/sindresorhus/time-grunt/issues/30
  // For some indication of what this weirdness with timegruntexit is about.
  function exit(exitCode) {
    clearInterval(interval);
    process.emit('timegruntexit', exitCode);
  }
  process.exit = exit;

  var interval = setInterval(function() {
    process.exit = exit;
  }, 1);

  process.on('SIGINT', function() {
    process.exit();
  });

  process.once('timegruntexit', function(exitCode) {
    clearInterval(interval);
    process.exit = originalExit;

    process.stdout.write = originalWrite;

    if (exitCode) {
      process.stdout.write('\n' + output);
    } else {
      process.stdout.write('\n');
    }

    process.exit(exitCode);
  });
}

module.exports = {
   showDots: showDots,
   passthroughWrite: passthroughWrite
};
