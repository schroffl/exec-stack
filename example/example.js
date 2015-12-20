var ExecStack = require('../index.js');
var stack = new ExecStack();

stack.push(function(data, next) {
    console.log('1');
    next();
});

stack.push(function(data, next) {
    console.log('2');
    next();
});

stack.push('my_event', function(data, next) {
    console.log(data);
    next();
});

stack.execute(this, {'this': ['is', 'a', 'test']}); 
// OUTPUT: 1
// OUTPUT: 2

stack.execute('my_event', this, {'this': ['is', 'a', 'test']});
// OUTPUT: 1
// OUTPUT: 2
// OUTPUT: { this: [ 'is', 'a', 'test' ] }