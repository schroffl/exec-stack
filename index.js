'use strict';

const EventEmitter = require('events').EventEmitter;
const ANY_EVENT = 0xFF; // A representative for any event

class ExecStack {

    /**
     * @author schroffl
     * 
     * @constructor
     *
     * @returns A new instance of ExecStack
     */

    constructor() {
        this._stack = [];
        this._context = {};
    }

    /**
     * Set the context to be applied to middleware
     * 
     * @author schroffl
     *
     * @param {Object} [context={}] - The context to be applied to middleware
     */

    context(context) {
        // Clear to context to an empty object if the parameter is ommitted
        this._context = typeof context === 'object' ? context : {};
        return this;
    }

    /**
     * Push a middleware to the stack
     * 
     * @author schroffl
     *
     * @param {String} [event=ANY_EVENT] - The specific event to listen for
     * @param {Function} callback - A function to be called on execution of the stack
     *
     * @returns The position of the middleware in the stack
     */

    use() {
        const args = Array.from(arguments);
        
        let event = typeof args[0] === 'function' ? ANY_EVENT : args.shift(),
            callback = typeof args[0] === 'function' ? args.shift() : () => {};

        return this._stack.push({ event, callback });
    }

    /**
     * Remove a middleware from the stack
     * 
     * @author schroffl
     *
     * @param {Number} position - The position of the middleware in the stack
     */

    unuse() {
        this._stack.splice(arguments[0], 1);
    }

    /**
     * Execute the stack
     * 
     * @author schroffl
     * 
     * @param {String} [event=ANY_EVENT] - The event to propagate
     *
     * @returns A promise being resolved when the stack has been fully traversed
     */

    run() {
        const args = Array.from(arguments),
              controller = new EventEmitter();

        let event = typeof args[0] === 'function' ? ANY_EVENT : args.shift();

        return new Promise((resolve, reject) => {
            controller.on('next', i => {
                let current = this._stack[i];

                // If i exceeds the amount of functions on the stack and none has thrown => resolve
                if(i > this._stack.length)
                    return resolve({ event, 'arguments': args.slice() });
                // current is undefined ?! => continue
                else if(!current)
                    return controller.emit('next', i + 1);
                // If the middleware is neither listening for all events nor the specified one => continue
                else if(current.event !== ANY_EVENT && current.event !== event)
                    return controller.emit('next', i + 1);

                let passArgs = args.slice();

                // If the middleware is listening for all events tell it what it's getting notified about
                if(current.event === ANY_EVENT) passArgs.unshift(event);

                const next = () => controller.emit('next', i + 1);
                next.throw = err => reject(err);

                // Push the "next" function
                passArgs.push(next);

                current.callback.apply(this._context, passArgs);
            });

            // Start the snowball
            controller.emit('next', 0);
        });
    }
}

module.exports = ExecStack;