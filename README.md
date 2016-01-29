# Super Simple Sheets

The simplest way to read (and only read) cells from Google Sheets.

## API

You gotta include the package.

```javascript
const sheets = require('super-simple-sheets');
```

### .info(opts)

Get info about a spreadsheet. The `opts.spreadsheet` is required. Returns a Promise.

```javascript
let info = await sheets.info({
  spreadsheet: '1bd1gOD7bE6pfJjTIt4iBjoI3OxBfRUXQv4ZT4EoSrVY'
});

info.id;           // '1bd1gOD7bE6pfJjTIt4iBjoI3OxBfRUXQv4ZT4EoSrVY'
info.title;        // 'Test Spreadsheet'
info.author.name;  // 'Sheldon Dinkleberg'
info.author.email; // 'the.turners.suck@gmail.com'

// .updated is a proper Date object
info.updated.toISOString(); // 'Fri Mar 30 2001 00:00:00 GMT-0500 (EST)'

// .worksheets is an array of worksheet objects
let worksheet = info.worksheets[0];

worksheet.id    // 'ob6'
worksheet.title // 'Test Worksheet'
worksheet.rows  // 100
worksheet.cols  // 5

worksheet.updated.toISOString(); // 'Fri Mar 30 2001 00:00:00 GMT-0500 (EST)'
```

### .cells(opts)

Read the cells of a spreadsheet. Both `opts.spreadsheet` and `opts.worksheet` are required. Returns a Promise for a sparse two dimensional array. The array is zero-indexed.

```javascript
let cells = await sheets.cells({
  spreadsheet: '1bd1gOD7bE6pfJjTIt4iBjoI3OxBfRUXQv4ZT4EoSrVY',
  worksheet: 'ob6'
});

cells[0][1] // 'foo'
cells[1][3] // null
cells[2][4] // 'bar'
```

You can also get a subset of the cells.

```javascript
sheets.cells({ ..., rows: 3, cols: 3 });
```

You can shift the top left corner of the subset. `x` and `y` are zero indexed.

```javascript
sheets.cells({ ..., x: 4, y: 7, rows: 3, cols: 3 });
```

Alternatively you can use R1C1 notation or A1 notation.

```javascript
sheets.cells({ ..., range: 'R1C1:R3C3' });
sheets.cells({ ..., range: 'A1:C3' });
```

Note that the array will be absolutely positioned. If you're grabbing a subset from the middle of the sheet, the values will be offset from the start of the array.

```javascript
let cells = await sheets.cells({ ..., x: 4, y: 7, rows: 3, cols: 3 });

cells[0]    // undefined (row is outside range)
cells[4][7] // defined
cells[6][9] // defined
cells[6][1] // undefined (column is outside range)
cells[7]    // undefined (row is outside range)
```

### .using(opts)

Create a wrapper around the API with some default values.

```javascript
let spreadsheet = sheets.using({
  spreadsheet: '1bd1gOD7bE6pfJjTIt4iBjoI3OxBfRUXQv4ZT4EoSrVY',
  key: './path/to/keyfile.json'
});

const info = await spreadsheet.info();
```

We have to go deeper.

```javascript
let worksheet = spreadsheet.using({ worksheet: info.worksheets[0].id });

let cells = await worksheet.cells({ range: 'R1C1:R3C3' });
```

## Authorization

If your spreadsheet is private, you can authorize the module using a Google Service Account JSON keyfile. It looks something like

```json
{
  "private_key_id": "some_key_id",
  "private_key": "SOME_REALLY_LONG_KEY_STRING",
  "client_email": "the.turners.suck@gmail.com",
  "client_id": "sheldon_dinkleberg",
  "type": "service_account"
}
```

You can provide the key as a filepath

```javascript
let info = await sheets.info({
  key: './path/to/keyfile.json',
  spreadsheet: '...'
});
```

or as an object

```javascript
let key = require('./path/to/keyfile.json');

let info = await sheets.info({
  key: key,
  spreadsheet: '...'
});
```

or through the environment. It doesn't need to be called out in that case.

```bash
GOOGLE_APPLICATION_CREDENTIALS=path/to/keyfile.json node example.js
```

```javascript
let info = await sheets.info({
  spreadsheet: '1bd1gOD7bE6pfJjTIt4iBjoI3OxBfRUXQv4ZT4EoSrVY'
});
```
