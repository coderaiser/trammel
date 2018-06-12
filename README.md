# Trammel

Get directory size.

If you want get realtime size updates use [dirsize](https://github.com/coderaiser/node-dirsize).

## Example

```js
const trammel = require('trammel');

trammel('.', (error, size) => {
    console.log(error, size);
    //undefined '58.47kb'
});

trammel('.', {type: 'raw'}, (error, size) => {
    console.log(error, size);
    //undefined 59974
});

trammel('do not exist', {stopOnError: true}, (error, size) => {
    if (error)
        return console.error(error.message);
    
    console.log(size);
});

```

## License

MIT

