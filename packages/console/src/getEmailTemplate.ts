import fs from 'fs';
import hbs from 'handlebars';
import path from 'path';

export default (name: string, replacements = {}) => {
  const filepath = path.join(__dirname, '../views/emails', `${name}.html`);
  const template = fs.readFileSync(filepath, { encoding: 'utf8', flag: 'r' });
  return hbs.compile(template)(replacements);
};
