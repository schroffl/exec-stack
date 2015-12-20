"use strict";

var EventEmitter = require('events').EventEmitter;

function ExecStack() {
    this._stack = [];
    this._config = {
        'strict': false
    }
    
    for(var prop in arguments[0]) this._config[prop] = arguments[0][prop];

    ExecStack.prototype.push = function() {
        var args = Array.prototype.slice.call(arguments);
        var event = typeof args[0] === 'string' ? args.shift() : '<all>';
        
        for(var i=0; i<1; i++) {
            var callback = typeof args[i] === 'function' ? args[i] : function(){};
            return (this._stack.push({'event': event, 'callback': callback}) - 1);
        }
    }
    
    ExecStack.prototype.remove = function() {
        this._stack.splice(arguments[0], 1);
    }
    
    ExecStack.prototype.execute = function(event, callbackFunction) {
        var args = Array.prototype.slice.call(arguments);
        var controller = new EventEmitter();
        var event = typeof args[0] === 'string' ? args.shift() : '<all>';
        var callbackFunction = typeof args[0] === 'function' ? args.shift() : function(){};
        var self = this;
        
        controller.on('next', function(i) {
            if(i > self._stack.length) return callbackFunction();
            else if(typeof self._stack[i] === 'undefined') return controller.emit('next', i + 1);
            else if((self._stack[i].event !== event && (self._config.strict ? true : self._stack[i].event !== '<all>')) || typeof self._stack[i].callback !== 'function') return controller.emit('next', i + 1);

            var currArgs = args.slice();
            var context = typeof args[0] === 'object' ? currArgs.shift() : {};
            
            currArgs.push(function() {
                controller.emit('next', i + 1);
            });
            
            self._stack[i].callback.apply(context, currArgs);
        });
        
        controller.emit('next', 0);
    }
}

module.exports = ExecStack;