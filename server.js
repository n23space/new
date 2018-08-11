var https = require('https');
var fs = require('fs');
var url = require('url');
var path = require('path');
var express = require('express');
var busboy = require('connect-busboy');
var app = express();
app.use(busboy());
if(typeof require !== 'undefined') XLSX = require('xlsx');

var FILE_LOCATION = './Files/';
app.all("/api/*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST");
  return next();
});
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
  var file = './Files/' + req.path.replace("_",".").replace("/","");
  var workbook = XLSX.readFile(file);
  var dataObj = XLSX.utils.sheet_to_row_object_array(workbook.Sheets.Sheet1);
  var data = {};
  data.headers = sheet_object_to_arrays(dataObj, 1);
  data.values = sheet_object_to_arrays(dataObj, 0);
  res.send(data);
});

app.post('/updatedata', function (req, res) {

  console.log('Updating file at ' + FILE_LOCATION);
  var body = '';
  req.on('data', function (data) {
    body += data;
    // Too much POST data, kill the connection!
    // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
    if (body.length > 1e6) {
      req.connection.destroy();
    }
  });  
  req.on('end', function () {
    var post = JSON.parse(body);
    console.log('Post ' + post.file);
    try {
      var xlData = post.values;
      xlData.unshift(post.headers);
    } catch(e) {
      console.log('Error writing file ' + e);
    }
    //writeExcel(xlData, 'time.xlsx');
    console.log('writing file ' + post.file);
    writeExcel(xlData, FILE_LOCATION + post.file);
    res.writeHead(200, {'Content-Type': 'text/html'});   
    res.end();
  });
});

app.post('/snowdata', function (req, res) {
  console.log('Get snowdata');
  var body = '';
  req.on('data', function (data) {
    body += data;
    if (body.length > 1e6) {
      req.connection.destroy();
    }
  });
  
  req.on('end', function () {
    console.log('Body ' + body);
    const user = 'admin';
    const pass = '1@Welcome';
    var options = {
       host: 'dev56805.service-now.com',
       port: '443',
       path: '/incident.do?JSONv2&sysparm_action=getRecords&sysparm_query=number=' + body,
       auth: user + ':' + pass,
       method: 'GET'  
    };
    console.info(options);
    var dataa = '';
    // Callback function is used to deal with response
    var reqGet = https.request(options, function(response){
       ///console.log('StatusCode: ',  response.statusCode);
       //console.log('Header: ',  response.headers);
       response.on('data', function(d){
        dataa += d;
        //process.stdout.write(d);
       });
       response.on('end', function(){
          res.send(dataa);
       });
    });
    
    reqGet.on('error', function(e){
      console.error(e);
      res.send(e);
    });
    reqGet.end();
  });
});

app.get('/files', function (req, res) {
  console.log('Get files');
  fs.readdir('./Files', function(err, files){
    console.log(files);
    res.send(files); 
  });
});
/*
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
*/
app.post('/*upload', function (req, res) {
  var fstream;
  req.pipe(req.busboy);
  req.busboy.on('file', function (fieldname, file, filename) {
      console.log("Uploading: " + filename); 
      fstream = fs.createWriteStream(__dirname + '/Files/' + filename);
      file.pipe(fstream);
      fstream.on('close', function () {
          res.redirect('back');
      });
  });
});

app.post('/download*', function (req, res) {
  var fileName = req.path.split('/')[2];
  console.log("Downloading... " + fileName);
  var file = __dirname + '/Files/' + fileName + '.xlsx';
  res.setHeader('Content-disposition', 'attachment; filename=' + file);
  res.download(file, fileName + '.xlsx'); // Set disposition and send it.
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
  console.log('Writing file: ' + fileName);
  var ws = sheet_from_array_of_arrays(data);
  var workbook = XLSX.readFile(fileName);
  workbook.Sheets.Sheet1 = ws;
  /* add worksheet to workbook */
  //wb.SheetNames.push(ws_name);
  //wb.Sheets[ws_name] = ws;

  /* write file */
  XLSX.writeFile(workbook, fileName);
}
