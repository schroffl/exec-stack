# ExecStack [![npm version](https://badge.fury.io/js/exec-stack.svg)](https://badge.fury.io/js/exec-stack)


## <a name="installation"></a> Installation
```javascript
$ npm install exec-stack
```

## <a name="example"></a> Example
```javascript
const ExecStack = require('exec-stack');
```

```javascript
const stack = new ExecStack();

stack.use('cars', next => {
	console.log('I\'m specifically interested in cars');
	next();
});

stack.use((event, next) => {
	console.log('I\'m generic. Hence interested in anything, also', event);
	next();
});

stack.run('cars');
stack.run('bikes').then(console.log('Done!'));
```

Output:
```
I'm specifically interested in cars
I'm generic. Hence interested in anything, also cars
I'm generic. Hence interested in anything, also bikes
Done!
```

## <a name="methods"></a> Methods
Optional arguments are written in *cursive*.

### <a name="method-push"></a> .use(*event*, callback)
Push a middleware to the stack. If *event* is omitted, the callback will be called for every execution of the stack.  
Returns the position of the middleware in the stack.

### <a name="method-remove"></a> .unuse(position)
Removes a specified middleware from the stack.
The middleware is referenced by its index in the stack.

### <a name="method-run"></a> .run(*event*, ...args)
Any other argument that is given to `.run()` will also be passed to the functions in the stack.  
Returns a promise that will resolve after every middleware has finished.  
If any middleware calls next.throw() the promise will be rejected.

### <a name="method-context"></a> .context(*context*)
Set the context to be applied to middleware. When *context* is omitted it will be cleared to an empty object.

## Breaking the loop
If you want to stop the execution of the stack use ```next.throw(*error*)``` which also will reject the promise returned by .run()
