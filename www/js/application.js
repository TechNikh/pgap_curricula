var Application = {
  initApplication: function() {
    $(document)
      .on('pageinit', '#settings-page', function() {
        Application.initAddFeedPage();
      })
      .on('pageinit', '#list-feeds-page', function() {
    	var categParent = this.getAttribute('data-url').replace(/(.*?)parent=/g, '');
        Application.initListFeedPage(categParent);
      });
    Application.openLinksInApp();
  },
  initAddFeedPage: function() {
	$("#clearCacheBtn").click(function(){
		console.log("droidsung: in clearCacheBtn nik-" + JSON.stringify(cordova.file.externalRootDirectory));
		// http://stackoverflow.com/questions/29678186/how-to-get-documents-in-an-android-directory-that-phonegap-will-see/29905718#29905718
		var localURLs    = [
		                    //cordova.file.dataDirectory,
		                    //cordova.file.documentsDirectory,
		                    //cordova.file.externalApplicationStorageDirectory,
		                    //cordova.file.externalCacheDirectory,
		                    //cordova.file.externalRootDirectory,
		                    //cordova.file.externalDataDirectory,
		                    //cordova.file.sharedDirectory,
		                   // cordova.file.syncedDataDirectory,
		                   // cordova.file.applicationDirectory,
		                   // cordova.file.applicationStorageDirectory,
		                   // cordova.file.cacheDirectory,
		                   // cordova.file.tempDirectory,
		                    'file:///storage/extSdCard/eschool2go/'
		                ];
		var index = 0;
		var i;
		var statusStr = "";
		console.log("droidsung: before openDatabase");
		app.db = window.sqlitePlugin.openDatabase({name: "eschooltogoSQLitee.db", location: 'default'});
		console.log("droidsung: after openDatabase");
		app.prepareCacheTables();

		var mdFileParse = function (fileEntry) {
			console.log("dbase in mdFileParse"+ JSON.stringify(fileEntry));
			fileEntry.file(function (file) {
		        var reader = new FileReader();

		        reader.onloadend = function() {
		            console.log("Successful file read mdFileParse: " + this.result);
		            var mdFileData = this.result;
		            if (mdFileData) {
			            var YAMLfileData = mdFileData.substring(4, mdFileData.lastIndexOf("---"));
			            var description = mdFileData.substring(mdFileData.lastIndexOf("---")+3);
			            //console.log("YAMLfileData mdFileParse: **" + YAMLfileData + "%%");
			            var doc = jsyaml.load(YAMLfileData);
			            console.log("yaml parsed mdFileParse: " + JSON.stringify(doc));
			            var filePathWithoutExt = fileEntry.fullPath.substring(1, fileEntry.fullPath.lastIndexOf("."));
			            var fileExt = fileEntry.fullPath.substring(fileEntry.fullPath.lastIndexOf(".")+1);
			            console.log("filePathWithoutExt mdFileParse: " + filePathWithoutExt);
			            console.log("fileExt mdFileParse: " + fileExt);
			            console.log("description mdFileParse: " + description);
			            app.insertYAMLrecord(fileEntry.name, filePathWithoutExt, fileExt, doc.title, description);
		            }
		        };

		        reader.readAsText(file);

		    }, onErrorReadFile);
		};
		var onErrorReadFile = function (e) {
			console.log("dbase in onErrorReadFile mdFileParse"+ JSON.stringify(e));
		};
		var addFileEntry = function (entry) {
			console.log("nik- in addFileEntry");
		    var dirReader = entry.createReader();
		    dirReader.readEntries(
		        function (entries) {
		        	console.log("nik- entries: "+ JSON.stringify(entries));
		            var fileStr = "";
		            var i;
		            for (i = 0; i < entries.length; i++) {
		                if (entries[i].isDirectory === true) {
		                    // Recursive -- call back into this subdirectory
		                    addFileEntry(entries[i]);
		                } else {
		                   fileStr += (entries[i].fullPath + "<br>"); // << replace with something useful
		                   index++;
		                   console.log("dbase before insertinggg: ");
						  /*
						   * If there is a .md file in the current location, 
						   * Get the title from the YAML file
						   */
		                   // Files that don't start with . for deleted files
		                   if(entries[i].name.endsWith(".md") && (entries[i].name.substring(0,1) != '.')){
		                	   console.log("dbase mdFileFullPath first char: **" + entries[i].name.substring(0,1) + "^^");
		                     var mdFileFullPath = entries[i].fullPath;
		                     //mdFileFullPath: /storage/extSdCard/eschool2go/_videos/Khan Academy/math/algebra/algebra-functions/analyzing-functions-alg1/_01wqwsb66E.md58
		                     console.log("dbase mdFileFullPath: " + mdFileFullPath);
		                     //Check for the file. 
		                     window.resolveLocalFileSystemURL('file://' + mdFileFullPath, mdFileParse, addError);
		                   }else if(entries[i].name.endsWith(".mp4")){
		                	   var filePathWithoutExt = entries[i].fullPath.substring(1, entries[i].fullPath.lastIndexOf("."));
		   		               var fileExt = entries[i].fullPath.substring(entries[i].fullPath.lastIndexOf(".")+1);
		                	   app.insertVideoRecord(entries[i].name, filePathWithoutExt, fileExt);
		                   }else if(entries[i].name.endsWith(".jpg") || entries[i].name.endsWith(".png")){
		                	   var filePathWithoutExt = entries[i].fullPath.substring(1, entries[i].fullPath.lastIndexOf("."));
		   		               var fileExt = entries[i].fullPath.substring(entries[i].fullPath.lastIndexOf(".")+1);
		                	   app.insertImageRecord(entries[i].name, filePathWithoutExt, fileExt);
		                   }
		                }
		            }
		            // add this directory's contents to the status
		            statusStr += fileStr;
		            // display the file list in #results
		            if (statusStr.length > 0) {
		              $("#results").html(statusStr);
		            } 
		        },
		        function (error) {
		            console.log("readEntries error: " + error.code);
		            statusStr += "<p>readEntries error: " + error.code + "</p>";
		        }
		    );
		};
		var addError = function (error) {
		    console.log("getDirectory error: " + error.code);
		    statusStr += "<p>getDirectory error: " + error.code + ", " + error.message + "</p>";
		};
		for (i = 0; i < localURLs.length; i++) {
		    if (localURLs[i] === null || localURLs[i].length === 0) {
		        continue; // skip blank / non-existent paths for this platform
		    }
		    window.resolveLocalFileSystemURL(localURLs[i], addFileEntry, addError);
		}
	});
    $('#settings-form').submit(function(event) {
      event.preventDefault();
      var sdcardLoc = $('#sdcard-loc').val().trim();
    });
  },
  initListFeedPage: function(categParent) {
	  console.log("dbase parent: " + categParent);
	  if(categParent.indexOf("list-feeds.html") !== -1){
		  // Contains list-feeds.html.
	  categParent = "storage/extSdCard/eschool2go/_videos";
  		}
	  console.log("dbase parent: " + categParent);
	// change ID to be dynamic
	    var hyphened_categParent = categParent.replace(/\//g, '-');
	    // Replace spaces with -
	    hyphened_categParent = hyphened_categParent.replace(/\s+/g, '-');
	    $('#feeds-list').attr("id","feeds-list-"+hyphened_categParent);
	    console.log("dbase 1: " + hyphened_categParent);
	    var $feedsList = $('#feeds-list-'+hyphened_categParent);
	    console.log("dbase 2: " + hyphened_categParent);
	  app.db = window.sqlitePlugin.openDatabase({name: "eschooltogoSQLitee.db", location: 'default'});
	  app.db.transaction(function(transaction) {
		  //transaction.executeSql("SELECT * FROM cache_video_files", [], function (tx, results) {
		  transaction.executeSql("SELECT cache_video_files.*, cache_yaml_files.display_name, cache_image_files.name AS image_file_name FROM cache_video_files LEFT JOIN cache_yaml_files ON cache_video_files.path = cache_yaml_files.path LEFT JOIN cache_image_files ON cache_video_files.path = cache_image_files.path WHERE cache_video_files.path LIKE '" + categParent + "/%'", [], function (tx, results) {
			  /*
			   * results all files recursively within all sub folders of categParent
			   * We need to list only the files & folders in the current categParent folder
			   */
			  var len = results.rows.length, i;
			  console.log("dbase len: " + len);
			  //$("#rowCount").append(len);
			  var listItemsArray = [];
			  var listItemsObj = {}
			  for (i = 0; i < len; i++){
				  //$("#TableData").append("<tr><td>"+results.rows.item(i).id+"</td><td>"+results.rows.item(i).name+"</td><td>"+results.rows.item(i).path+"</td></tr>");
				  var filePathWithOutExt = results.rows.item(i).path;
				  var filePathWithExt = filePathWithOutExt + "." + results.rows.item(i).extension;
				  console.log("dbase path: " + filePathWithExt);
				  var filePathArray = filePathWithExt.split("/");
				  var categParentNumOfSlashes = (categParent.split("/").length - 1);
				  var filePathNumOfSlashes = (filePathArray.length - 1);
				  console.log("dbase categParentNumOfSlashes: " + categParentNumOfSlashes);
				  var listItemName = filePathArray[1 + categParentNumOfSlashes];
				  console.log("dbase listItemName: " + listItemName);
				  listItemsArray.push(listItemName);
				  // Find if listItemName isFile or isDir
				  if(filePathNumOfSlashes == (categParentNumOfSlashes + 1)){
					  listItemsObj[listItemName] = {"isFile": true, "ext": results.rows.item(i).extension, "name": results.rows.item(i).display_name, "image": results.rows.item(i).image_file_name};
				  }else{
					  // listItemName is directory
					  listItemsObj[listItemName] = {"isFile": false, "name": listItemName};
				  }
			  	}
			  //console.log("dbase listItemsObj " + JSON.stringify(listItemsObj));
			  $.each(listItemsObj, function(i, el){
				  console.log("dbase in each loop: "+ el);
				  // If el is a file with an extension for video file, 
				  if(el.isFile == true){
					  console.log("dbase file " + el);
					  var file_display_name = i;
					  if (el.name){
						  file_display_name = el.name;
					  }
					  var image_html = '';
					  if (el.image){
						  image_html = '<img width="230px" src="file:///'+categParent+'/'+el.image+'" />';
					  }
					  var htmlItems = '<li>'+image_html+'<span onclick="window.plugins.fileOpener.open(\'file:///'+categParent+'/'+i+'\')">' + file_display_name + '</span></li>';
				  }else{
					  // If there is no period in the file name, it might be a directory.
					  console.log("dbase directory " + el);
					  var htmlItems = '<li><a href="list-feeds.html?parent=' + categParent + "/" + i + '">' + el.name + '</a></li>';
			  	  }
				  //var htmlItems = '<li><a href="list-feeds.html?parent=' + categParent + "/" + el + '">' + el + '</a></li>';
				  console.log("dbase htmlItems " + htmlItems);
				  $feedsList.append(htmlItems);
			  });
			  console.log("dbase before refresh: ");
			  $feedsList.listview('refresh');
		  }, null);
	  });
  },
  initAurelioPage: function() {
    $('a[target=_blank]').click(function() {
      $(this).closest('li').removeClass('ui-btn-active');
    });
  },
  checkRequirements: function() {
    console.log(navigator);
    return true;
    if (navigator.connection.type === Connection.NONE) {
      return false;
    }

    return true;
  },
  updateIcons: function() {
	  console.log("in updateIcons");
    var $buttons = $('a[data-icon], button[data-icon]');
    var isMobileWidth = ($(window).width() <= 480);
    isMobileWidth ? $buttons.attr('data-iconpos', 'notext') : $buttons.removeAttr('data-iconpos');
  },
  openLinksInApp: function() {
    $(document).on('click', 'a[target=_blank]', function(event) {
      event.preventDefault();
      window.open($(this).attr('href'), '_blank');
    });
  }
};
