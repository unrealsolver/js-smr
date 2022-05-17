# js-smr
This application uses `names` from source map to restore original variable names.
It does not use original source code, it only relies on source maps.
Also the script does not make code more readable - use `prettier` for that.
## Example
It can convert file from this:
```
function sum(n,o){return n+o}console.log(sum(10,20));
```
to this:
```
function sum(lvalue,rvalue){return lvalue+rvalue}console.log(sum(10,20));
```
For the reference, original code:
```
function sum(lvalue, rvalue) {
    return lvalue + rvalue;
}
console.log(sum(10, 20));
```
## Local installation & usage
```
npm i -prod
npm link
js-smr ./patj/to/file.js
```

## Additional tools - ranges.py
This script recreates directories structures for single concatenated
JS file, which uses `define('/path/to/file', (...) => ...),...` concatenation
