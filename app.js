var app = angular.module("app", []);
app.service('modalData', function(){
    //var modal = {};
    this.mData = {};
    this.mData.msg = 'Initial Value';
    this.setData = function(data){
        this.mData.msg = data;
    };
    this.getData = function(){
        return this.mData;
    };
    //return modal;
});
app.service('downloadFile', ['$http', function($http){
    this.fileName = '';
    this.download = function(fName){
        this.postFile = 'download/' + this.fileName;
        $http.post(this.postFile, {}, {responseType: 'arraybuffer'})
        .then(function (response) {
          var headers = response.headers();
          var blob = new Blob([response.data],{type:headers['content-type']});
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = 'test';
          link.click();
        });
    };
}]);
app.controller("mainControl", function($scope, $rootScope, $timeout, $http){
    $scope.toView = "list"
    $scope.$on('formdata', function(evt, data) {
        $scope.toView = 'form';
    });
    $scope.fileDownload = function (){
        $http.post('download', {}, {responseType: 'arraybuffer'})
        .then(function (response) {
          var headers = response.headers();
          var blob = new Blob([response.data],{type:headers['content-type']});
          var link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = "Filename";
          link.click();
        });
    };
});
app.controller("showlist", function ($scope, $http, $rootScope, $timeout, $window, modalData){
  $scope.listView = 1;
  $scope.showlist = true;
  $scope.data = '';
  $scope.message = modalData.mData;
  $scope.saved = false;
  $scope.chbxCell = false;
  $scope.chbxEdit = false;
  $scope.$on('getFileData', function(evt, file){
      $scope.ufile = file.name;
      $scope.file = file.name.replace(".","_");
      $scope.getData($scope.file);
  });
  
  $scope.$watch('message', function(nV, oV, scope){
    if (nV === oV || typeof nV == 'undefined' || nV.msg == '') return;
    $scope.addColumn(nV);
  }, true);

  $scope.getData = function (file) {
      $http.get(file)
      .then(function(response) {
          $scope.data = response.data;
          $scope.data.file = $scope.ufile;
      });
  };
     
  $scope.btnSave = function() {
		$http.post("updatedata", $scope.data)
		.then(function(response) {
			$scope.saved = true;
            $timeout(function(){ $scope.saved = false; }, 3000);
		});
	};

	$scope.newHeader = function (){
		$scope.headers.push($scope.nHeader);
	};  
  $scope.editRow = function (row){
      try {
          $rootScope.$broadcast('formdata', {h: $scope.data.headers, d: $scope.data.values, r: row});
          $scope.listView = 0;
      } catch(e){
          console.log(e);
      }
  };
  $scope.showlisting = function (){
      $scope.listView = 1;
      $rootScope.$broadcast('hideform', {});
  };
  $scope.myfunction = function($event){
      console.log(angular.element($event.target).prop('offsetLeft'));
  };

  $scope.addColumn = function(cName){
      $scope.data.headers.push(cName.msg);
  };

  $scope.addRow = function(){
      $scope.data.values.push([]);
  } 
});

app.controller("showNav", function ($scope, $http, $rootScope){
    $http.get("files")
    .then(function(response) {
        $scope.files = response.data;
        $scope.getFileName = 'time.xlsx';
        $scope.getFileData($scope.getFileName);        
    });
    $scope.getFileData = function (file) {
        var fdata = {};
        fdata.name = file;
        $rootScope.$broadcast('getFileData', fdata);
    };
    $scope.fileDownload = function ($http){
          $http.post('download', {}, {responseType: 'arraybuffer'})
          .then(function (response) {
            var headers = response.headers();
            var blob = new Blob([response.data],{type:headers['content-type']});
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = "Filename";
            link.click();
          });
    };
});

app.controller('showform', function($scope, $rootScope){
    var ele = document.getElementById('form_display');
    $scope.$on('formdata', function(evt, data) {
        elePos(ele);
        $scope.showingform = 1;
        $scope.dnAwDisable = false;
        $scope.upAwDisable = false;
        $scope.data = data;
        elePos(ele);
    });
    $scope.$on('hideform', function(evt, data){
        $scope.showingform = 0;
        //alert('hideform2');
    });
    $scope.nextRow = function(){
        if (parseInt($scope.data.r) < parseInt($scope.data.d.length - 1)) {
            $scope.data.r = $scope.data.r + 1;
            if($scope.upAwDisable) {
                $scope.upAwDisable = false;
            }
            if (parseInt($scope.data.r) == parseInt($scope.data.d.length - 1)) {
               $scope.dnAwDisable = true; 
            }
        } else {
            $scope.dnAwDisable = true;
        }
    }
    $scope.prevRow = function(){
      if (parseInt($scope.data.r) > 0) {
          $scope.data.r = $scope.data.r - 1;
          if($scope.dnAwDisable) {
              $scope.dnAwDisable = false;
          }
          if (parseInt($scope.data.r) == 0) {
              $scope.upAwDisable = true;        
          }
      } else {
          $scope.upAwDisable = true;
      }
    }
    $scope.example = {
        value: new Date(2017, 4, 14)
    }
});

app.controller('modalCont', function($scope, $rootScope, $element,modalData){
    $scope.message = '';
    $element.on('hidden.bs.modal', function(){
      if ($scope.message != '') {
        modalData.setData($scope.message);
        $rootScope.$digest();  
      }
    });
});

app.directive('niContextMenu', function($http, downloadFile) {
   //define the directive object
   var directive = {};
   
   //restric  t = E, signifies that directive is Element directive
   directive.restrict = 'EA';
   directive.link = function(scope, element, attr, $scope) {
      element.on("contextmenu", function(e, $scope){
          e.preventDefault();
          var elLg = document.createElement("div");
          elLg.className = "list-group row";
          elLg.style.boxShadow = '0 6px 12px rgba(0,0,0,.175)';

          var elA = document.createElement("a");
          elA.className = "list-group-item";

          var elDiv = document.createElement("div");
          elDiv.className = 'context-menu';
          elA.onclick = function(){
              downloadFile.fileName = element[0].textContent;
              downloadFile.download();
          };
          var text = document.createTextNode("Download file"); 
          elA.appendChild(text);  
          elLg.appendChild(elA);  
          elDiv.style.display = 'block';
          elDiv.style.position = 'absolute';
          elDiv.style.left = e.pageX + 'px';
          elDiv.style.top = e.pageY + 'px';
          elDiv.appendChild(elLg);
          document.body.appendChild(elDiv);
      });
   };
   //template replaces the complete element with its text. 
   //directive.template = "Student: <b>{{student.name}}</b> , Roll No: <b>{{student.rollno}}</b>";
   
   //scope is used to distinguish each student element based on criteria.
   /*directive.scope = {
      student : "=name"
   }*/
   
   //compile is called during application initialization. AngularJS calls it once when html page is loaded.
    
   /*directive.compile = function(element, attributes) {
      element.css("border", "1px solid #cccccc");
      
      //linkFunction is linked with each element with scope to get the element specific data.
      var linkFunction = function($scope, element, attributes) {
         element.html("Student: <b>"+$scope.student.name +"</b> , Roll No: <b>"+$scope.student.rollno+"</b><br/>");
         element.css("background-color", "#ff00ff");
      }
      return linkFunction;
   }*/
   return directive;
});

app.directive('myDraggable', ['$document', function($document) {
  return {
    link: function(scope, element, attr) {
      var startX = 0, startY = 0, x = 0, y = 0;

      element.css({
       position: 'relative',
       border: '1px solid red',
       backgroundColor: 'lightgrey',
       cursor: 'pointer'
      });

      element.on('mousedown', function(event) {
        // Prevent default dragging of selected content
        event.preventDefault();
        startX = event.pageX - x;
        startY = event.pageY - y;
        $document.on('mousemove', mousemove);
        $document.on('mouseup', mouseup);
      });

      function mousemove(event) {
        y = event.pageY - startY;
        x = event.pageX - startX;
        element.css({
          top: y + 'px',
          left:  x + 'px'
        });
      }

      function mouseup() {
        $document.off('mousemove', mousemove);
        $document.off('mouseup', mouseup);
      }
    }
  };
}]);

function elePos(element){
    var bodyRect = document.body.getBoundingClientRect(),
    elemRect = element.getBoundingClientRect(),
    offset   = elemRect.top - bodyRect.top;
    var rect = element.getBoundingClientRect();
    var leftOff = angular.element(element).prop('offsetLeft');
    console.log(rect.top, rect.right, rect.bottom, rect.left);
    console.log('Element is ' + offset + ' vertical pixels from <body>');
    console.log('Element offsetLeft - ' + leftOff);
}