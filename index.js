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

        let event = typeof args[0] === 'function' ? ANY_EVENT : args.shift(),
            resolve = null, 
            reject = null,
            promise = new Promise((res, rej) => {
                resolve = res;
                reject = rej;
            });

        controller.on('next', i => {
            let current = this._stack[i];

            // If i exceeds the amount of functions on the stack => abort
            if(i > this._stack.length)
                return resolve();
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

            current.callback.apply({}, passArgs);
        });

        // Start the snowball
        controller.emit('next', 0);

        return promise;
    }
}

module.exports = ExecStack;