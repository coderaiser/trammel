'use strict';

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events').EventEmitter;

const format = require('format-io');

/*  The lstat() function shall be equivalent to stat(),
    except when path refers to a symbolic link. In that case lstat()
    shall return information about the link, while stat() shall return
    information about the file the link references. 
*/
const stat = fs.lstat;

module.exports = (dir, options, callback) => {
    const emitter = new EventEmitter();
    
    let total = 0;
    let type;
    
    if (!callback) {
        callback    = options;
        options     = {};
    } else {
        type        = options.type;
    }
    
    check(dir, callback);
    
    emitter.on('file', (file, stat) => {
        total += stat.size;
    });
    
    emitter.on('error', callback);
    
    emitter.on('end', () => {
        if (type === 'raw')
            return callback(null, total);
        
        callback(null, format.size(total));
    });
    
    processDir(dir, options, emitter);
};

function processDir(dir, options, emitter) {
    const stopOnError = options.stopOnError;
    let wasError = false;
    let asyncRunning = 0;
    let fileCounter = 1;
    
    const execCallBack = () => {
        const isError = wasError && stopOnError;
        const isDone = !fileCounter && !asyncRunning;
    
        if (!isDone || isError)
            return;
     
        emitter.emit('end');
    };
    
    const getDirInfo = (dir) => {
        stat(dir, getStat.bind(null, dir));
    };
    
    getDirInfo(dir);
    
    function getStat(dir, error, stat) {
        --fileCounter;
        
        if (error && stopOnError) {
            wasError = true;
            emitter.emit('error', error);
            return;
        }
        
        if (error)
            return execCallBack();
        
        const isDir = stat.isDirectory();
        
        if (!isDir) {
            emitter.emit('file', dir, stat);
            execCallBack();
            return;
        }
        
        ++asyncRunning;
        
        execCallBack();
        
        fs.readdir(dir, (error, files) => {
            asyncRunning--;
            
            if (!error)
                return onReaddir(dir, files);
            
            if (error && stopOnError) {
                wasError = true;
                emitter.emit('error', error);
            }
            
            execCallBack();
        });
    }
    
    function onReaddir(dir, files) {
        const n = files.length;
        
        fileCounter += n;
        
        if (!n)
            return execCallBack();
        
        files.forEach((file) => {
            const dirPath = path.join(dir, file);
            getDirInfo(dirPath);
        });
    }
}

function check(dir, callback) {
    if (!dir)
        throw Error('dir could not be empty!');
    
    if (!callback)
        throw Error('callback could not be empty!');
    
}
