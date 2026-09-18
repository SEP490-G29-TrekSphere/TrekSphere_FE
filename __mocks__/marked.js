const marked = {
  parse: (str) => (typeof str === 'string' ? str : ''),
  parseInline: (str) => (typeof str === 'string' ? str : ''),
  use: () => {},
  setOptions: () => {},
};

module.exports = {
  marked,
};
