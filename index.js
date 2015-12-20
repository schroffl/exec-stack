"use strict";

var EventEmitter = require('events').EventEmitter;

function ExecStack() {
    this.stack = [];

    ExecStack.prototype.push = function() {
        var args = Array.prototype.slice.call(arguments);
        var event = typeof args[0] === 'string' ? args.shift() : '<all>';
        
        for(var i=0; i<1; i++) {
            var callback = typeof args[i] === 'function' ? args[i] : function(){};
            return (this.stack.push({'event': event, 'callback': callback}) - 1);
        }
    }
    
    ExecStack.prototype.remove = function() {
        this.stack.splice(arguments[0], 1);
    }
    
    ExecStack.prototype.execute = function(event) {
        var args = Array.prototype.slice.call(arguments);
        var controller = new EventEmitter();
        var event = typeof args[0] === 'string' ? args.shift() : '<all>';
        var self = this;
        
        controller.on('next', function(i) {
            if(i > self.stack.length) return;
            else if(typeof self.stack[i] === 'undefined') return controller.emit('next', i + 1);
            else if((self.stack[i].event !== event && self.stack[i].event !== '<all>' ) || typeof self.stack[i].callback !== 'function') return controller.emit('next', i + 1);
            
            var currArgs = args.slice();
            var context = typeof args[0] === 'object' ? currArgs.shift() : {};
            
            currArgs.push(function() {
                controller.emit('next', i + 1);
            });
            
            self.stack[i].callback.apply(context, currArgs);
        });
        
        controller.emit('next', 0);
    }
    
}

module.exports = ExecStack;