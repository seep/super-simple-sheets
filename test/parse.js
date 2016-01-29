const fs = require('fs');
const test = require('blue-tape');
const parse = require('../src/parse');

function fixture(name) {

  const filepath = `${ __dirname }/fixtures/${ name }`;
  const contents = fs.readFileSync(filepath, { encoding: 'utf8' });
  return parse.response({ body: contents });

}

test('parse info', assert => {

  return fixture('info.xml').then(data => {

    const parsed = parse.spreadsheet(data);

    assert.equal(parsed.id, 'test_spreadsheet');
    assert.equal(parsed.title, 'Test Spreadsheet');
    assert.equal(parsed.updated.toISOString(), '2015-01-01T00:00:00.000Z');

    assert.same(parsed.author, {
      name: 'test',
      email: 'test@test.com'
    });

    const ws = parsed.worksheets[0];

    assert.equal(ws.id, 'test_worksheet');
    assert.equal(ws.title, 'Test Worksheet');
    assert.equal(ws.updated.toISOString(), '2015-01-01T00:00:00.000Z');

  });

});

test('parse cells', assert => {

  return fixture('cells.xml').then(data => {

    const parsed = parse.cells(data);

    const exact = [
      [ 'R1C1', 'R1C2', 'R1C3', 'R1C4' ],
      [ 'R2C1', 'R2C2', 'R2C3', 'R2C4' ],
      [ 'R3C1', 'R3C2', 'R3C3', 'R3C4' ],
      [ 'R4C1', 'R4C2', 'R4C3', 'R4C4' ]
    ];

    assert.same(parsed, exact);

  });

});
