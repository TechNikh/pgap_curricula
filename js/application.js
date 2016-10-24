var sdcardLoc = '';

var Application = {
  initApplication : function() {
    $(document).on('pageinit', '#settings-page', function() {
      Application.initSettingsPage();
    }).on(
        'pageinit',
        '#list-explorer-page',
        function() {
          var categParent = this.getAttribute('data-url').replace(
              /(.*?)parent=/g, '');
          Application.initListExplorerPage(categParent);
        });
    Application.openLinksInApp();
  },
  fail : function(error) {
    console.log("nik-error" + error.code + error.message);
    if (error.message) {
      navigator.notification.alert('Error: ' + error.message);
    }
  },
  initSettingsPage : function() {
    if (sdcardLoc) {
      $('#sdcard-loc').val(sdcardLoc);
    }
    $("#copyDBtoSDcard").click(
        function() {
          // console.log("droidbase: in copyDBtoSDcard");
          // /data/data/com.technikh.eschooltogo/databases
          // console.log("droidbase:
          // "+cordova.file.applicationStorageDirectory); //
          // file:///data/data/com.technikh.eschooltogo/
          window.resolveLocalFileSystemURL(
              cordova.file.applicationStorageDirectory
                  + "databases/eschooltogoSQLitee.db", AppFile.copyDBtoSDcard,
              Application.fail);
        });
    $("#copyDBfromSDcard").click(
        function() {
          // console.log("droidbase: in copyDBfromSDcard");
          var settings = JSON.parse(window.localStorage.getItem('settings'));
          sdcardLoc = settings.sdcardLoc;
          // console.log("nik-success sdcardLoc"+sdcardLoc);
          window.resolveLocalFileSystemURL("file:///" + sdcardLoc
              + "_databases/eschooltogoSQLitee.db", AppFile.copyDBfromSDcard,
              Application.fail);
        });
    $("#clearCacheBtn").click(
        function() {
          // console.log("droidsung: in clearCacheBtn nik-" +
          // cordova.file.externalRootDirectory);
          var settings = JSON.parse(window.localStorage.getItem('settings'));
          sdcardLoc = settings.sdcardLoc;

          // console.log("droidsung: before openDatabase");
          app.db = window.sqlitePlugin.openDatabase({
            name : "eschooltogoSQLitee.db",
            location : 'default'
          });
          // console.log("droidsung: after openDatabase");
          app.prepareCacheTables();

          // console.log("resolveLocalFileSystemURL: " + sdcardLoc);
          window.resolveLocalFileSystemURL("file:///" + sdcardLoc,
              Application.addFileEntry, Application.fail);
        });
    $('#settings-form').submit(function(event) {
      event.preventDefault();
      sdcardLoc = $('#sdcard-loc').val().trim();
      var settings = {
        "sdcardLoc" : sdcardLoc
      };
      window.localStorage.setItem('settings', JSON.stringify(settings));
      navigator.notification.alert('Settings saved.');
    });
  },
  initListExplorerPage : function(categParent) {
    // console.log("dbase parent: " + categParent);
    if (categParent.indexOf("explorer.html") !== -1) {
      // Contains explorer.html.
      categParent = "_videos";
    }
    // console.log("dbase parent: " + categParent);
    // change ID to be dynamic
    var hyphened_categParent = categParent.replace(/\//g, '-');
    // Replace spaces with -
    hyphened_categParent = hyphened_categParent.replace(/\s+/g, '-');
    $('#contents-list').attr("id", "contents-list-" + hyphened_categParent);
    // console.log("dbase 1: " + hyphened_categParent);
    var $contentsList = $('#contents-list-' + hyphened_categParent);
    // console.log("dbase 2: " + hyphened_categParent);
    app.db = window.sqlitePlugin.openDatabase({
      name : "eschooltogoSQLitee.db",
      location : 'default'
    });
    app.db
        .transaction(function(transaction) {
          // transaction.executeSql("SELECT * FROM cache_video_files", [],
          // function (tx, results) {
          transaction
              .executeSql(
                  "SELECT cache_video_files.*, cache_yaml_files.display_name, cache_image_files.name AS image_file_name FROM cache_video_files LEFT JOIN cache_yaml_files ON cache_video_files.path = cache_yaml_files.path LEFT JOIN cache_image_files ON cache_video_files.path = cache_image_files.path WHERE cache_video_files.path LIKE '"
                      + categParent + "/%'",
                  [],
                  function(tx, results) {
                    /*
                     * results all files recursively within all sub folders of
                     * categParent We need to list only the files & folders in
                     * the current categParent folder
                     */
                    var len = results.rows.length, i;
                    // console.log("dbase len: " + len);
                    // var listItemsArray = [];
                    var listItemsObj = {}
                    for (i = 0; i < len; i++) {
                      var filePathWithOutExt = results.rows.item(i).path;
                      var filePathWithExt = filePathWithOutExt + "."
                          + results.rows.item(i).extension;
                      // console.log("dbase path: " + filePathWithExt);
                      var filePathArray = filePathWithExt.split("/");
                      var categParentNumOfSlashes = (categParent.split("/").length - 1);
                      var filePathNumOfSlashes = (filePathArray.length - 1);
                      // console.log("dbase categParentNumOfSlashes: " +
                      // categParentNumOfSlashes);
                      var listItemName = filePathArray[1 + categParentNumOfSlashes];
                      // console.log("dbase listItemName: " + listItemName);
                      // listItemsArray.push(listItemName);
                      // Find if listItemName isFile or isDir
                      if (filePathNumOfSlashes == (categParentNumOfSlashes + 1)) {
                        listItemsObj[listItemName] = {
                          "isFile" : true,
                          "ext" : results.rows.item(i).extension,
                          "name" : results.rows.item(i).display_name,
                          "image" : results.rows.item(i).image_file_name
                        };
                      } else {
                        // listItemName is directory
                        listItemsObj[listItemName] = {
                          "isFile" : false,
                          "name" : listItemName
                        };
                      }
                    }
                    // console.log("dbase listItemsObj " +
                    // JSON.stringify(listItemsObj));
                    $
                        .each(
                            listItemsObj,
                            function(i, el) {
                              // console.log("dbase in each loop: "+ el);
                              // If el is a file with an extension for video
                              // file,
                              if (el.isFile == true) {
                                // console.log("dbase file " + el);
                                var file_display_name = i;
                                if (el.name) {
                                  file_display_name = el.name;
                                }
                                var image_html = '';
                                if (el.image) {
                                  image_html = '<img width="230px" src="file:///'
                                      + sdcardLoc
                                      + categParent
                                      + '/'
                                      + el.image + '" />';
                                }
                                var htmlItems = '<li>'
                                    + image_html
                                    + '<span onclick="window.plugins.fileOpener.open(\'file:///'
                                    + sdcardLoc + categParent + '/' + i
                                    + '\')">' + file_display_name
                                    + '</span></li>';
                              } else {
                                // If there is no period in the file name, it
                                // might be a directory.
                                // console.log("dbase directory " + el);
                                var htmlItems = '<li><a href="explorer.html?parent='
                                    + categParent
                                    + "/"
                                    + i
                                    + '">'
                                    + el.name
                                    + '</a></li>';
                              }
                              // var htmlItems = '<li><a
                              // href="explorer.html?parent=' + categParent +
                              // "/" + el + '">' + el + '</a></li>';
                              // console.log("dbase htmlItems " + htmlItems);
                              $contentsList.append(htmlItems);
                            });
                    // console.log("dbase before refresh: ");
                    $contentsList.listview('refresh');
                  }, null);
        });
  },
  addFileEntry : function(entry) {
    // console.log("nik- in addFileEntry");
    var dirReader = entry.createReader();
    dirReader
        .readEntries(
            function(entries) {
              // console.log("nik- entries: "+ JSON.stringify(entries));
              var fileStr = "";
              var i;
              for (i = 0; i < entries.length; i++) {
                if (entries[i].isDirectory === true) {
                  // Recursive -- call back into this subdirectory
                  Application.addFileEntry(entries[i]);
                } else {
                  fileStr += (entries[i].fullPath + "<br>"); // << replace with
                  // something useful
                  // index++;
                  // console.log("dbase before insertinggg: ");
                  /*
                   * If there is a .md file in the current location, Get the
                   * title from the YAML file
                   */
                  // Files that don't start with . for deleted files
                  if (entries[i].name.endsWith(".md")
                      && (entries[i].name.substring(0, 1) != '.')) {
                    // console.log("dbase mdFileFullPath first char: **" +
                    // entries[i].name.substring(0,1) + "^^");
                    var mdFileFullPath = entries[i].fullPath;
                    // mdFileFullPath:
                    // /storage/extSdCard/eschool2go/_videos/Khan
                    // Academy/math/algebra/algebra-functions/analyzing-functions-alg1/_01wqwsb66E.md58
                    // console.log("dbase mdFileFullPath: " + mdFileFullPath);
                    // Check for the file.
                    window.resolveLocalFileSystemURL(
                        'file://' + mdFileFullPath, AppFile.mdFileParse,
                        Application.fail);
                  } else if (entries[i].name.endsWith(".mp4")) {
                    var filePathWithoutExt = entries[i].fullPath.substring(1,
                        entries[i].fullPath.lastIndexOf("."));
                    // Don’t store SD card location in Database
                    filePathWithoutExt = filePathWithoutExt
                        .substring(filePathWithoutExt
                            .lastIndexOf("/eschool2go/") + 12);
                    var fileExt = entries[i].fullPath
                        .substring(entries[i].fullPath.lastIndexOf(".") + 1);
                    app.insertVideoRecord(entries[i].name, filePathWithoutExt,
                        fileExt);
                  } else if (entries[i].name.endsWith(".jpg")
                      || entries[i].name.endsWith(".png")) {
                    var filePathWithoutExt = entries[i].fullPath.substring(1,
                        entries[i].fullPath.lastIndexOf("."));
                    filePathWithoutExt = filePathWithoutExt
                        .substring(filePathWithoutExt
                            .lastIndexOf("/eschool2go/") + 12);
                    var fileExt = entries[i].fullPath
                        .substring(entries[i].fullPath.lastIndexOf(".") + 1);
                    app.insertImageRecord(entries[i].name, filePathWithoutExt,
                        fileExt);
                  }
                }
              }
              // add this directory's contents to the status
              $("#results").append(fileStr);
            }, Application.fail);
  },
  checkRequirements : function() {
    // console.log(navigator);
    return true;
    if (navigator.connection.type === Connection.NONE) {
      return false;
    }

    return true;
  },
  updateIcons : function() {
    var $buttons = $('a[data-icon], button[data-icon]');
    var isMobileWidth = ($(window).width() <= 480);
    isMobileWidth ? $buttons.attr('data-iconpos', 'notext') : $buttons
        .removeAttr('data-iconpos');
  },
  openLinksInApp : function() {
    $(document).on('click', 'a[target=_blank]', function(event) {
      event.preventDefault();
      window.open($(this).attr('href'), '_blank');
    });
  }
};
