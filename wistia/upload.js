(function() {
  'use strict';

  angular
    .module('app')
    .component('uploadfile', {
      cache : false,
      templateUrl: "uploadtemplate.html",
      bindings: { id: '@', wistiapass : '@' },
	  controller : FileUploadController
  });

  function FileUploadController($timeout, $sce, $http){
  
    var fileCtrl = this;
       
      fileCtrl.hashId   = '';
      fileCtrl.progress = 0;
      fileCtrl.status   = 'idle';
	  fileCtrl.url   = '';
	  fileCtrl.$onInit = function() {
     
		//  fileCtrl.initializeUploadCtrl();
	  };
	  

	  
	  fileCtrl.updateStatus = function() {
        $http({
          method: 'GET',
          url: 'https://api.wistia.com/v1/medias/' + fileCtrl.hashId + '.json?api_password=' + fileCtrl.wistiapass
        }).then(function (response) {
          fileCtrl.status = response.data.status || '';

          if (fileCtrl.status == 'ready')
            fileCtrl.url = $sce.trustAsResourceUrl('http://fast.wistia.net/embed/iframe/' + fileCtrl.hashId);
          else if (fileCtrl.status != 'failed') {
            //check status again in a few seconds
            $timeout(function(){
              fileCtrl.updateStatus();
            }, 3000);
          }
        });
      };

	  

	  //TODO::fileupload not working if moved to component's initialize
	  $timeout(
		function(){
    
        $(".fileControlHolder input").fileupload({
          dataType: 'json',
		      acceptFileTypes: /(\.|\/)(mp4)$/i,
          add: function (e, data) {
            fileCtrl.hashId   = '';
            fileCtrl.progress = 0;
            fileCtrl.status   = 'uploading';
			      fileCtrl.url   = '';
			      data.formData = {
			        	api_password: fileCtrl.wistiapass
			      };
            data.submit();
           // $(".fileControlHolder input").disable();
          },
		      fail: function (ev, data) {
			       fileCtrl.status   = data.errorThrown;
		      },
          done: function (e, data) {
            if (data.result.hashed_id != '') {
              fileCtrl.hashId = data.result.hashed_id;
			       //update status for given hashId
              fileCtrl.updateStatus();
              //console.log("after done")
            }
          },
          progressall: function (e, data) {
            if (data.total > 0) {
              $timeout(function(){
				          fileCtrl.progress = parseInt(data.loaded / data.total * 100, 10)
			        },0);
            }
          }
        }).on('fileuploadsubmit', function(e, data){
          
		          });
      }
	  );
  }
})();