var app = angular.module("app", []);
app.controller("mainControl", function($scope, $rootScope, $timeout){
    $scope.toView = "list"
    $scope.$on('formdata', function(evt, data) {
        $scope.toView = 'form';
    });
});
app.controller("showlist", function ($scope, $http, $rootScope, $timeout){
    $scope.listView = 1;
	$scope.showlist = true;
    $scope.data = '';
    $scope.saved = false;
    $scope.chbxHead = false;
    $scope.chbxCell = false;
    $scope.chbxEdit = false;
    $scope.$on('getFileData', function(evt, file){
        $scope.ufile = file.name;
        $scope.file = file.name.replace(".","_");
        $scope.getData($scope.file);
    });
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
            $rootScope.$broadcast('formdata', {h: $scope.data.headers, d: $scope.data.values[row]});
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
});

app.controller('showform', function($scope, $rootScope){
    var ele = document.getElementById('form_display');
    $scope.$on('formdata', function(evt, data) {
        elePos(ele);
        $scope.showingform = 1;
        $scope.data = data;
        elePos(ele);
    });
    $scope.$on('hideform', function(evt, data){
        $scope.showingform = 0;
        //alert('hideform2');
    });
});

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