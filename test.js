var times = {'name': "Neeraj"};
var test = 'times';
console.log([test]['name']);

return;
var fs = require('fs');
fs.readdir('./Files', function(err, files){
	console.log(files);
});



return; 
if(typeof require !== 'undefined') XLSX = require('xlsx');
var workbook = XLSX.readFile('time.xlsx');

//workbook.Sheets.Sheet1.K11 = 'testing';
//console.log(JSON.stringify(workbook.Sheets.Sheet1));
//XLSX.writeFile(workbook, 'time.xlsx');
//console.log(XLSX.utils.decode_cell('D5'));
//console.log(XLSX.utils.encode_cell({c:3,r:4}));
//return;

//var hdr = sheet_object_to_arrays(XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1));
//console.log(JSON.stringify(workbook.Sheets.Sheet1));
//var data = [[], []];
//console.log(workbook.Sheets.Sheet1);
//console.log(XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1));
//console.log(sheet_object_to_arrays(XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1), 0));
var data = sheet_object_to_arrays(XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1), 0);
console.log(data[data[0].length - 2][3]);
//console.log('array of ' + data.length + ':' + data[0].length + '|' + data );
data[data[0].length - 2][data.length - 1] = 'testing the file write';
writeExcel(data, 'time.xlsx');
function writeExcel(data, fileName) {
  //var ws_name = "SheetJS";
  var ws = sheet_from_array_of_arrays(data);
  var workbook = XLSX.readFile(fileName);
  workbook.Sheets.Sheet1 = ws;
  /* add worksheet to workbook */
  //wb.SheetNames.push(ws_name);
  //wb.Sheets[ws_name] = ws;

  /* write file */
  XLSX.writeFile(workbook, fileName);
}

return;
//console.log(XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1));
//console.log(JSON.stringify(workbook));
//console.log(JSON.stringify(XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1)));
//console.log(JSON.stringify(workbook.Sheets.Sheet1));
var firstCheck = 1;
var secondCheck = 1;
var data = [];
var rows = [];
data.push('test');
rows.push(data);
console.log(JSON.stringify(rows));
return
var cellAddr;
console.log('=====================================');
//console.log(JSON.stringify(XLSX.utils.sheet_to_json(workbook.Sheets.Sheet1)));
for (cell in workbook.Sheets.Sheet1){
	
	if (firstCheck) {
		console.log('first time');
		firstCheck = 0;
		continue;
	}
	//console.log('it is working..');
	cellAddr = XLSX.utils.decode_cell(cell);
	//console.log(JSON.stringify(cellAddr));
	data[cellAddr.r][cellAddr.c] = cell.v;
	//console.log(JSON.stringify(workbook.Workbook.Sheets.Sheet1));
}
console.log(JSON.stringify(data));
//workbook.Sheets.Sheet1.B10.v = "test";
//XLSX.writeFile(workbook, 'time.xlsx');
return;

function datenum(v, date1904) {
	if(date1904) v+=1462;
	var epoch = Date.parse(v);
	return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
	var ws = {};
	var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
	for(var R = 0; R != data.length; ++R) {
		for(var C = 0; C != data[R].length; ++C) {
			if(range.s.r > R) range.s.r = R;
			if(range.s.c > C) range.s.c = C;
			if(range.e.r < R) range.e.r = R;
			if(range.e.c < C) range.e.c = C;
			var cell = {v: data[R][C] };
			if(cell.v == null) continue;
			var cell_ref = XLSX.utils.encode_cell({c:C,r:R});
			
			if(typeof cell.v === 'number') cell.t = 'n';
			else if(typeof cell.v === 'boolean') cell.t = 'b';
			else if(cell.v instanceof Date) {
				cell.t = 'n'; cell.z = XLSX.SSF._table[14];
				cell.v = datenum(cell.v);
			}
			else cell.t = 's';
			
			ws[cell_ref] = cell;
		}
	}
	if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);
	return ws;
}

/* original data */
/*var data = [ { 	'#': '1',
    			Name: 'Neeraj',
    			DOB: '23-Jun',
    			City: 'City',
    			Status: 'Status',
    			Quantity: 'Quantity',
    			Comments: 'Comments',
    			Issues: 'Issues',
    			'Next Date': 'Next Date',
    			Time: 'time' },
  			{ '#': '2', Name: 'Pranjali', DOB: '14-Apr', Quantity: '4' },
  			{ '#': '3', Name: 'Neetu', DOB: '16-Feb' },
  			{ '#': '4', Name: 'Nikhil', DOB: '13-Mar', Quantity: '5' },
  			{ '#': '5',
    			Name: 'Papa',
    			DOB: '23-Mar',
    			Status: 'Yes',
    			Quantity: 'I',
    			Comments: 'am',
    			Issues: 'expert' },
			{ '#': '6', Name: 'Mum', DOB: '27-Oct' },
			{ Quantity: 'sdfksdf' },
  			{ City: 'Neeraj' } ];
*/
function sheet_object_to_arrays(data, opts) {
	var headers = [];
	var aData = []; 
	var row = [];
	//console.log(data.length);
	for (var i = 0; i < data.length; i++) {
		for (p in data[i]) {
			//console.log(headers.indexOf(p));
			if (headers.indexOf(p) == -1) {
				headers.push(p);
			}
		}
	};
	if(opts){
		return headers;
	}
	//console.log(headers);
	aData.push(headers);
	//console.log(headers.length);
	for (var i = 0; i < data.length; i++) {
		row = [];
		for (var j = 0; j < headers.length; j++) {
			if (data[i][headers[j]]) {
				row.push(data[i][headers[j]]);
			} else {
				row.push('');
			}
		};
		/*for (p in data[i]) {
			if (headers.indexOf(p)) {
				row[headers.indexOf(p)] = data[i][p];
			}
		}*/
		aData.push(row);
	};
	return aData;
}
var ws_name = "SheetJS";

function Workbook() {
	if(!(this instanceof Workbook)) return new Workbook();
	this.SheetNames = [];
	this.Sheets = {};
}

var wb = new Workbook(), ws = sheet_from_array_of_arrays(data);

/* add worksheet to workbook */
wb.SheetNames.push(ws_name);
wb.Sheets[ws_name] = ws;

/* write file */
//XLSX.writeFile(wb, 'test.xlsx');