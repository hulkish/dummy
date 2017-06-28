```
const babel = require("babel-core");

const input = `
const myArray = [1, 2, 3];
let lastItem;
myArray.forEach((item) => {
  lastItem = item;
});
`;

const output = babel.transform(input, {
  plugins: [require('babel-plugin-minify-simplify')]
}).code;

console.log(
  output
);
```
outputs:
```
const myArray = [1, 2, 3];
let lastItem;
myArray.forEach(item => {
  lastItem = item;
});
```
