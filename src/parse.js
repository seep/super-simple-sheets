const promisify = require('pify');
const xml = require('xml2js');

/**
 * Force a value into an array.
 */
const arrayed = value => Array.isArray(value) ? value : [ value ];

/**
 * Parse the body of a Google Spreadsheet API response into JSON.
 * @returns a Promise for the data object.
 */
const parseResponse = promisify(function(response, done) {

  xml.parseString(response.body, { explicitArray: false, explicitRoot: false, mergeAttrs: true }, done);

});

/**
 * Parse raw spreadsheet metadata into a simple object.
 */
function parseSpreadsheet(data) {

  let { id, updated, title, author, entry } = data;

  id = id.split('/')[5];
  updated = new Date(updated);

  let rows = parseInt(data['gs:rowCount']);
  let cols = parseInt(data['gs:colCount']);

  let worksheets = arrayed(entry).map(parseWorksheet);

  return { id, updated, title, author, rows, cols, worksheets };

}

/**
 * Parse raw worksheet metadata into a simple object.
 */
function parseWorksheet(data) {

  let { id, updated, title } = data;

  id = id.split('/')[6];
  updated = new Date(updated);

  let rows = parseInt(data['gs:rowCount']);
  let cols = parseInt(data['gs:colCount']);

  return { id, updated, title, rows, cols };

}

/**
 * Parse raw cell feed data into a two dimensional array.
 */
function parseCells(data) {

  let { entry } = data;

  return arrayed(entry).reduce((result, cell) => {

    let { row, col } = cell['gs:cell'];

    row = parseInt(row) - 1;
    col = parseInt(col) - 1;

    let val = cell['content'];

    result[row] = result[row] || [];
    result[row][col] = val;

    return result;

  }, []);

}

module.exports = {

  response:    parseResponse,
  spreadsheet: parseSpreadsheet,
  worksheet:   parseWorksheet,
  cells:       parseCells

}
