const promisify = require('pify');
const defaults = require('lodash.defaults');
const pick = require('lodash.pick');

const auth = require('./auth');
const parse = require('./parse');

// Promisify the request library, with some default headers.
const request = promisify(require('request').defaults({ 'GData-Version': '3.0' }));

/**
 * Get info about a spreadsheet.
 */
function info(opts) {

  let { spreadsheet } = opts;

  let uri = `https://spreadsheets.google.com/feeds/worksheets/${spreadsheet}`;

  return auth.authorize(opts, { method: 'get', uri })
    .then(request)
    .then(parse.response)
    .then(parse.spreadsheet);

}

/**
 * Read cells from a spreadsheet.
 */
function cells(opts) {

  let { spreadsheet, worksheet } = opts;

  let uri = `https://spreadsheets.google.com/feeds/cells/${spreadsheet}/${worksheet}`;
  let qs = pick(opts, 'range');

  return auth.authorize(opts, { method: 'get', uri, qs })
    .then(request)
    .then(parse.response)
    .then(parse.cells);

}

/**
 * Returns a function that merges the supplied params and the default params.
 */
function rebind(defaults, func) {

  return function(opts) {

    let merged = defaults(opts || {}, defaults);
    func(merged);

  }

}

/**
 * Returns a copy of the API that uses the provided default options.
 */
function using(defaults) {

  // If we leave the key as is, the auth object will get recreated for every
  // request. So we eagerly promote it to the auth object.
  defaults.auth = auth.create(defaults);

  return {
    info: rebind(info, defaults),
    cells: rebind(cells, defaults)
  };

}

module.exports = { info, cells, using };
