const fs = require('fs');
const hbs = require('handlebars');
const path = require('path');

const getTemplate = (name, replacements = {}) => {
  const filepath = path.join(__dirname, 'templates', `${name}.html`);
  const template = fs.readFileSync(filepath, { encoding: 'utf8', flag: 'r' });
  return hbs.compile(template)(replacements);
};

module.exports = { getTemplate };
