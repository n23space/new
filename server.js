var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var express = require('express');
var app = express();
if(typeof require !== 'undefined') XLSX = require('xlsx');

app.use(express.static('./'));
// Create a server
app.get('/', function(req, res){
  console.log('Get default');
  res.sendFile( __dirname + "/" + "index.html");
});

app.get('/index.html', function (req, res) {
  console.log('Get index.html');
  res.sendFile( __dirname + "/" + "index.html");
});

app.get('/*_xlsx', function (req, res) {
  console.log('Get xlsx - ' + req.path);
  var file = req.path.replace("_",".").replace("/","");
  var workbook = XLSX.readFile(file);
  var dataObj = XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1);
  var data = {};
  data.headers = sheet_object_to_arrays(dataObj, 1);
  data.values = sheet_object_to_arrays(dataObj, 0);
  res.send(data);
});

app.post('/updatedata', function (req, res) {

  console.log('Post time');
  var body = '';
  req.on('data', function (data) {
    body += data;
    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6) {
      request.connection.destroy();
    }
  });  
  req.on('end', function () {
    var post = JSON.parse(body);
    console.log('Post time' + post.file);
    var xlData = post.values;
    xlData.unshift(post.headers);
    //writeExcel(xlData, 'time.xlsx');
    writeExcel(xlData, post.file);
    res.writeHead(200, {'Content-Type': 'text/html'});   
    res.end();
  });
});

app.get('/time', function (req, res) {
  console.log('Get time');
  var workbook = XLSX.readFile('time.xlsx');
  var dataObj = XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1);
  var data = {};
  data.headers = sheet_object_to_arrays(dataObj, 1);
  data.values = sheet_object_to_arrays(dataObj, 0);
  res.send(data); 
});

app.get('/files', function (req, res) {
  console.log('Get files');
  fs.readdir('./Files', function(err, files){
    console.log(files);
    res.send(files); 
  });
});

app.post('/json-handler', function (req, res) {
  var body = '';
  req.on('data', function (data) {
    body += data;
    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6) {
      request.connection.destroy();
    }
  });  
  req.on('end', function () {
    var post = JSON.parse(body);
    //var fileData = fs.readFileSync('./nameDB.json', 'UTF-8');
    res.writeHead(200, {'Content-Type': 'text/html'});   
    res.end();
  });
});

var server = app.listen(process.env.PORT || 8081, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log(`Example app listening at http://${host}:${port}`);
}); 


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

function sheet_object_to_arrays(data, opts) {
  var headers = [];
  var aData = []; 
  var row = [];
  for (var i = 0; i < data.length; i++) {
    for (p in data[i]) {
      if (headers.indexOf(p) == -1) {
        headers.push(p);
      }
    }
  };
  if(opts){
    return headers;
  }
  //aData.push(headers);
  for (var i = 0; i < data.length; i++) {
    row = [];
    for (var j = 0; j < headers.length; j++) {
      if (data[i][headers[j]]) {
        row.push(data[i][headers[j]]);
      } else {
        row.push('');
      }
    };
    aData.push(row);
  };
  return aData;
}


function Workbook() {
  if(!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

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