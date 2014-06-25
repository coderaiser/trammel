trammel
=======

Get directory size.

```js
var trammel = require('trammel');

trammel.get('.', function(error, size) {
    console.log(error, size);
    //undefined '58.47kb'
});

trammel.get('.', {type: 'raw'}, function(error, size) {
    console.log(error, size);
    //undefined 59974
});

trammel.get('do not exist', {stopOnError: true, type: raw}, function(error, size) {
    console.log(error, size);
    //{ [Error: ENOENT, lstat 'do not exist'] errno: 34, code: 'ENOENT', path: 'do not exist' } 0
});

```