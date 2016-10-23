// cross-browser compatibility http://stackoverflow.com/questions/280634/endswith-in-javascript
if (typeof String.prototype.endsWith !== 'function') {
  String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
}
