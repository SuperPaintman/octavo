#!/usr/bin/env node

'use strict';
/** Requires */
const pify       = require('pify');

const assert     = require('assert');
const path       = require('path');
const fs         = pify(require('fs'));
const vm         = require('vm');

const _          = require('lodash');
const glob       = pify(require('glob'));
const Handlebars = require('handlebars');

const pkj        = require('../package.json');


/** Constants */
const MACRO_DIRECTIVE        = '@macro';
const UNPACK_DIRECTIVE       = '@unpack'
const REMOVE_DIRECTIVE_OPEN  = '@remove'
const REMOVE_DIRECTIVE_CLOSE = '/remove'

const GITIGNORE_PATH = path.join(__dirname, '../.gitignore');

const GITIGNORE_DIRECTIVE_OPEN  = '#code-generation-start';
const GITIGNORE_DIRECTIVE_CLOSE = '#code-generation-end';

const MACRO_COMMENT_REGEXP = new RegExp(
  String.raw`\/\*\*(?:[\n]|.)+?${MACRO_DIRECTIVE}\b((?:[\n]|.)*?)\*\/`,
  'g'
);
const UNPACK_COMMENT_REGEXP = new RegExp(
  String.raw`\/\*\*\s*${UNPACK_DIRECTIVE}\b((?:[\n]|.)*?)\*\/`,
  'g'
);
const REMOVE_COMMENT_REGEXP = new RegExp(
  String.raw`\/\*\*\s*${REMOVE_DIRECTIVE_OPEN}\s*\*\/((?:[\n]|.)*?)\/\*\*\s*${REMOVE_DIRECTIVE_CLOSE}\s*\*\/`,
  'g'
);

const SOURCES = [
  path.join(__dirname, '../src/**/*.__macro__.ts')
];


/** Helpers */
const banner = (source) => `/*!
 * WARNING!!!
 *
 * This is auto-generated file (from ${JSON.stringify(source)}), please don't
 * touch this!
 *
 * @source    ${JSON.stringify(source)}
 */`;

const posixifyPath = (p) => p.split(path.win32.sep).join(path.posix.sep);
const relativePath = (p) => path.relative(path.join(__dirname, '../'), p);
const formatPath = _.flow([
  relativePath,
  posixifyPath
]);

const replaceExt = (path) => path.replace(/\.__macro__\.ts$/, '.ts');


/** Init */
Handlebars.registerHelper('comma', (options) => options.data.last ? '' : ',');
Handlebars.registerHelper('semi', (options) => options.data.last ? ';' : '');
Handlebars.registerHelper('json', (obj) => JSON.stringify(obj, null, 2));
Handlebars.registerHelper('camelCase',  (str) => _.camelCase(str));
Handlebars.registerHelper('kebabCase',  (str) => _.kebabCase(str));
Handlebars.registerHelper('lowerCase',  (str) => _.lowerCase(str));
Handlebars.registerHelper('snakeCase',  (str) => _.snakeCase(str));
Handlebars.registerHelper('startCase',  (str) => _.startCase(str));
Handlebars.registerHelper('upperCase',  (str) => _.upperCase(str));
Handlebars.registerHelper('pascalCase', (str) => _.upperFirst(_.camelCase(str)));


/** Main */
async function getFilenames(sources) {
  const filenames = await Promise.all(sources.map((source) => glob(source)));

  return _.flatten(filenames);
}

async function getTemplates(filenames) {
  const templates = await Promise.all(
    filenames
      .map(async (template) => ({
        sourceAbs: posixifyPath(template),
        content:   await fs.readFile(template, 'utf8')
      }))
  );

  return templates
    .map((template) => _.merge(template, {
      pathinfo:   path.parse(template.sourceAbs),
    }))
    .map((template) => _.merge(template, {
      targetAbs: posixifyPath(path.format({
        dir:  template.pathinfo.dir,
        base: replaceExt(template.pathinfo.base)
      }))
    }))
    .map((template) => _.merge(template, {
      source:   formatPath(template.sourceAbs),
      target:   formatPath(template.targetAbs)
    }));
}

async function updateGitignore(filename, templates) {
  const gitignore = await fs.readFile(filename, 'utf8');

  const startIndex = gitignore.indexOf(GITIGNORE_DIRECTIVE_OPEN);
  const endIndex   = gitignore.indexOf(GITIGNORE_DIRECTIVE_CLOSE);

  let startPos;
  let endPos;
  let endLine = '';
  if (startIndex > -1 || endIndex > -1) {
    assert(startIndex > -1, `missing "${GITIGNORE_DIRECTIVE_OPEN}" directive in ".gitignore"`);
    assert(endIndex > -1, `missing "${GITIGNORE_DIRECTIVE_CLOSE}" directive in ".gitignore"`);

    startPos = startIndex;
    endPos   = endIndex + GITIGNORE_DIRECTIVE_CLOSE.length;
  } else {
    startPos = gitignore.length;
    endPos   = gitignore.length;
    endLine  = '\n';
  }

  const beforeContent = gitignore.slice(0, startPos);
  const afterContent  = gitignore.slice(endPos);

  const content = [
    GITIGNORE_DIRECTIVE_OPEN,
    ...templates
      .map((template) => path.join('/', template.target))
      .map(posixifyPath),
    GITIGNORE_DIRECTIVE_CLOSE
  ].join('\n');

  const fullContent = beforeContent + content + afterContent + endLine;

  await fs.writeFile(filename, fullContent, 'utf8');
}

function removeRemoves(content, save = false) {
  return content.replace(REMOVE_COMMENT_REGEXP, (match, str) => (
    save ? `/** ${REMOVE_DIRECTIVE_OPEN} ${str} ${REMOVE_DIRECTIVE_CLOSE} */` : ''
  ));
}

function unpackDirectives(content) {
  return content.replace(UNPACK_COMMENT_REGEXP, (match, str) => (
    str
      .trim()
  ));
};

function getScripts(content) {
  const matches = content.match(MACRO_COMMENT_REGEXP);

  if (matches === null) {
    return [];
  }

  return matches.map((script) => {
    const index = script.indexOf(MACRO_DIRECTIVE);

    return script
      .replace(MACRO_COMMENT_REGEXP, (match, str) => str)
      .split('\n')
      .map((line) => line.trim())
      .map((line) => line.slice(1)) // eat `*`
      .join('\n');
  });
};

function evalScripts(template, scripts) {
  const exports = scripts.map((src) => {
    const exports = {};
    const module = {
      exports
    };

    const sandbox = {
      exports,
      module,
      console,
      require,
      __dirname:   path.normalize(template.pathinfo.dir),
      __filename:  path.normalize(template.sourceAbs)
    };

    const context = new vm.createContext(sandbox);

    const script = new vm.Script(src);

    script.runInContext(context);

    return sandbox.module.exports;
  });

  return _.merge(...exports);
};

function macroexpand(template) {
  let content = template.content;

  content = removeRemoves(content);
  content = unpackDirectives(content);

  const scripts = getScripts(template.content);

  const scriptExport = evalScripts(template, scripts);

  const hbs = Handlebars.compile(content, {
    // strict: true,
    // assumeObjects: false
  });

  const result = [
    banner(template.source),
    '',
    hbs(scriptExport)
  ].join('\n');

  return result;
}

async function main({ sources, gitignore }) {
  const filenames = await getFilenames(sources);

  const templates = await getTemplates(filenames);

  await updateGitignore(gitignore, templates);

  for (const template of templates) {
    const data = await macroexpand(template);

    await fs.writeFile(template.targetAbs, data);
  }
}


/** Start */
if (!module.parent) {
  main({
    sources:   SOURCES,
    gitignore: GITIGNORE_PATH
  })
    .catch((err) => {
      console.error(err.stack);

      process.exit(1);
    });
}
