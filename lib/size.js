/* inspired by http://procbits.com/2011/10/29/a-node-js-experiment-thinking-asynchronously-recursion-calculate-file-size-directory */
(function(){
    'use strict';
    
    var fs          = require('fs'),
        path        = require('path'),
        
        format      = require('format-io'),
        
        EventEmitter= require('events').EventEmitter,
        
        /*  The lstat() function shall be equivalent to stat(),
            except when path refers to a symbolic link. In that case lstat()
            shall return information about the link, while stat() shall return
            information about the file the link references. 
        */
        stat    = fs.lstat;
    
    module.exports = function(dir, options, callback) {
        var type, stopOnError,
            ERROR_EMPTY     = 'could not be empty!',
            emitter         = new EventEmitter(),
            total           = 0;
        
        if (!callback) {
            callback    = options;
            options     = {};
        } else {
            type        = options.type;
            stopOnError = options.stopOnError;
        }
        
        if (!dir)
            throw(Error('dir ' + ERROR_EMPTY));
        
        if (!callback)
            throw(Error('callback' + ERROR_EMPTY));
        
        emitter.on('file', function(file, stat) {
            total      += stat.size;
        });
        
        emitter.on('error', function(error) {
            callback(error);
        });
        
        emitter.on('end', function() {
            var result;
            
            if (type !== 'raw')
                result  = format.size(total);
            else
                result  = total;
            
            callback(null, result);
        });
        
        processDir(dir, options, emitter);
    };
   
    function processDir(dir, options, emitter) {
        var stopOnError     = options.stopOnError,
            wasError        = false,
            asyncRunning    = 0,
            fileCounter     = 1,
            
            execCallBack    = function () {
                var noErrors    = !wasError || !stopOnError,
                    yesAllDone   = !fileCounter && !asyncRunning;
                
                if (yesAllDone && noErrors)
                    emitter.emit('end');
            },
            
            getDirInfo      = function(dir) {
               stat(dir, getStat.bind(null, dir));
            };
        
        getDirInfo(dir);
        
        function getStat(dir, error, stat) {
            var isDir;
            
            --fileCounter;
            
            if (!wasError || !stopOnError) {
                if (error && stopOnError) {
                    wasError    = true;
                    emitter.emmit('error', error);
                } else if (!error) {
                    isDir   = stat.isDirectory();
                    
                    if (!isDir) {
                        emitter.emit('file', dir, stat);
                    } else {
                        ++asyncRunning;
                        
                        fs.readdir(dir, function(error, files) {
                            asyncRunning--;
                            
                            if (!error) {
                                onReaddir(dir, files);
                            } else if (error && stopOnError) {
                                wasError = true;
                                emitter.emit('error', error);
                            }
                        });
                    }
                }
                
                execCallBack();
            }
        }
        
        function onReaddir(dir, files) {
            var n        = files.length;
            
            fileCounter += n;
            
            if (!n)
                execCallBack();
            else
                files.forEach(function(file) {
                    var dirPath     = path.join(dir, file);
                    
                    process.nextTick(function() {
                        getDirInfo(dirPath);
                    });
                });
        }
    }
    
})();
