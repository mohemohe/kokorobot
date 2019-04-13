const fs = require('fs');

const baseDir = '/kokorobot';
const current = require(`${baseDir}/package.json`);

fs.readdirSync(`${baseDir}/scripts`)
  .filter(_ => _ !== 'kokoro.io')
  .map(_ => `${baseDir}/scripts/${_}`)
  .filter(_ => fs.statSync(_).isDirectory())
  .forEach((dir) => {
    try {
      const extend = require(`${dir}/package.json`);
      Object.assign(current.dependencies, extend.dependencies || {});
      Object.assign(current.devDependencies, extend.devDependencies || {});
    } catch (e) {
      console.warn(`'${dir}' skipped:`, e);
    }
  });

fs.writeFileSync(`${baseDir}/package.json`, JSON.stringify(current));
