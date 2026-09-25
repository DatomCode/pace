const fs = require('fs');
const path = require('path');
const cssPath = path.join('src', 'index.css');
let css = fs.readFileSync(cssPath, 'utf8');
const lightMatch = css.match(/\.light\s*\{([\s\S]*?)\}/);
const darkMatch = css.match(/:root\s*\{([\s\S]*?)\}/);
if (lightMatch && darkMatch) {
  let newCss = css.replace(/\.light\s*\{([\s\S]*?)\}/, \.dark {\}\);
  newCss = newCss.replace(/:root\s*\{([\s\S]*?)\}/, \:root {\}\);
  fs.writeFileSync(cssPath, newCss, 'utf8');
}
