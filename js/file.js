var AppFile = {
  copyDBtoSDcard : function(fileEntry) {
    // console.log("dbase in mdFileParse"+ JSON.stringify(fileEntry));
    var settings = JSON.parse(window.localStorage.getItem('settings'));
    var sdcardLoc = settings.sdcardLoc;
    // console.log("nik-success sdcardLoc"+sdcardLoc);
    window.resolveLocalFileSystemURL("file:///" + sdcardLoc,
        function onSuccess(dirEntry) {
          dirEntry.getDirectory(SDCARD_DATABASE_FOLDER_NAME, {
            create : true,
            exclusive : false
          }, function onSuccess(dirEntry) {
            // console.log("nik-success parentEntry"+JSON.stringify(dirEntry));
            fileEntry.copyTo(dirEntry, "'"+DATABASE_NAME+"'", function() {
              // console.log('copying was successful')
              navigator.notification.alert('Copied database to SD card.');
            }, function() {
              console.log('unsuccessful copying');
              navigator.notification
                  .alert('Failed in Copying database to SD card.');
            });
          }, Application.fail);

        }, Application.fail);
  },
  copyDBfromSDcard : function(fileEntry) {
    // console.log("dbase in copyDBfromSDcard"+ JSON.stringify(fileEntry));
	window.resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory,
        function onSuccess(dirEntry) {
          dirEntry.getDirectory(APPLICATION_DATABASE_FOLDER_NAME, {
            create : true,
            exclusive : false
          }, function onSuccess(dirEntry) {
            // console.log("nik-success parentEntry"+JSON.stringify(dirEntry));
            fileEntry.copyTo(dirEntry, "'"+DATABASE_NAME+"'", function() {
			
			 if (window.location.href.indexOf(HOME_PAGE_NAME) !== -1) {
					Application.callClearCache();
				}else{
					navigator.notification.alert('Copied database from SD card.');
				}
				//navigator.notification.alert('Copied database from SD card.');
				//Application.callClearCache();
			}, function() {
              console.log('unsuccessful copying');
              //navigator.notification.alert('Failed in Copying database from SD card.');
            });
          }, Application.fail);

        }, Application.fail);
		
  },
  mdFileParse : function(fileEntry) {
    // console.log("dbase in mdFileParse"+ JSON.stringify(fileEntry));
    fileEntry.file(function(file) {
      var reader = new FileReader();

      reader.onloadend = function() {
        // console.log("Successful file read mdFileParse: " + this.result);
        var mdFileData = this.result;
        if (mdFileData) {
          var YAMLfileData = mdFileData.substring(4, mdFileData
              .lastIndexOf("---"));
          var description = mdFileData
              .substring(mdFileData.lastIndexOf("---") + 3);
          // console.log("YAMLfileData mdFileParse: **" + YAMLfileData + "%%");
          var doc = jsyaml.load(YAMLfileData);
          // console.log("yaml parsed mdFileParse: " + JSON.stringify(doc));
          var filePathWithoutExt = fileEntry.fullPath.substring(1,
              fileEntry.fullPath.lastIndexOf("."));
          filePathWithoutExt = filePathWithoutExt.substring(filePathWithoutExt
              .lastIndexOf("/eschool2go/") + 12);
          var fileExt = fileEntry.fullPath.substring(fileEntry.fullPath
              .lastIndexOf(".") + 1);
          // console.log("filePathWithoutExt mdFileParse: " +
          // filePathWithoutExt);
          // console.log("fileExt mdFileParse: " + fileExt);
          // console.log("description mdFileParse: " + description);
          app.insertYAMLrecord(fileEntry.name, filePathWithoutExt, fileExt,
              doc.title, description);
        }
      };

      reader.readAsText(file);

    }, Application.fail);
  }
};
