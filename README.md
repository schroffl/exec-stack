# ExecStack [![npm version](https://badge.fury.io/js/exec-stack.svg)](https://badge.fury.io/js/exec-stack)


## <a name="installation"></a> Installation
```javascript
$ npm install exec-stack
```

## <a name="example"></a> Example
```javascript
var ExecStack = require('exec-stack');
```

```javascript
var stack = new ExecStack();

stack.push(function(next) {
    console.log('This is called for every execution of the stack!');
    next();
});

stack.push('event', function(next) {
    console.log('This is called whenever `event` is being executed!');
    next();
});

stack.execute(); 
// OUTPUT: This is called for every execution of the stack!

stack.execute('event');
// OUTPUT: This is called for every execution of the stack!
// OUTPUT: This is called whenever `event` is being executed!
```

## <a name="options"></a> Options
Options are passed to the constructor.

### <a name="option-strict"></a> strict (*false*)
If true, **only** functions subscribed to the executed event are being called by [.execute()](#method-execute).

## <a name="methods"></a> Methods
Optional arguments are written in *cursive*.

### <a name="method-push"></a> .push(*event*, callback)
Push a function on the stack. If *event* is ommited, the callback will be called for every execution of the stack.
Returns the position of the item in the stack.

### <a name="method-remove"></a> .remove(item)
Removes a specified item from the stack.
The item is being referenced by a number representing its position, just like in an array.

### <a name="method-execute"></a> .execute(*event*, *context*, [...])
Execute the stack in the given context (context is set to an empty object by default).  
Any other argument that is given to `.execute()` will also be passed to the functions in the stack.  
