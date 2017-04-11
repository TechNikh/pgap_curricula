var sdcardLoc = '';
var annotationsObject = '4561';
var count = 0;
var Application = {
  initWebViewerPage : function(url) {
    console.log("initWebViewerPage: url " + url);
    // $('#web-view-frame').attr("src", url);
  },
  
  initPDFViewerPage : function(url) {
    console.log("initPDFViewerPage: url " + url);
    annotationsObject = url;
    // <iframe id="web-view-frame"
    // src='js/pdfjs-web/web/viewer.html?file=file://mnt/sdcard/Download/PGRDeclarationsPage.pdf'
    // height='627px' width='100%' scrolling='auto' frameBorder='0' ></iframe>
    // TODO: Remove examples/mobile-viewer/viewer.html will not work as it's canvas based & no HTML for annotations text in DOM
    //$('#pdf-view-frame').attr("src",
    //    "js/pdfjs/examples/mobile-viewer/viewer.html?file=" + url);
    $('#pdf-view-frame').attr("src", "js/pdfjs/web/viewer.html?file="+url);
  },

  initGoogleAnalytics : function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + 
                  'js/ga.js';
		  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  },
  
  initApplication : function() {
    var settingsFromLocalStorage = window.localStorage.getItem("'"
        + SETTING_LOCAL_STORAGE_NAME + "'");
    if (settingsFromLocalStorage && (settingsFromLocalStorage != null)) {
      settings = JSON.parse(settingsFromLocalStorage);
      if ((settings != null) && settings.sdcardLoc) {
        sdcardLoc = settings.sdcardLoc;
      }
    }

    if (window.localStorage.getItem(INSTALLATION_CHECK_VALUE) == undefined) {
      // Application.callFirstTimeApplicationLaunch();
      window.localStorage.setItem(INSTALLATION_CHECK_VALUE, true);
    }

    $(document).on('pageinit', '#' + SETTING_PAGE_ID, function() {
      Application.initSettingsPage();
    }).on('pageinit', '#' + WEB_VIEWER_PAGE_ID, function() {
      var url = this.getAttribute('data-url').replace(/(.*?)link=/g, '');
      Application.initWebViewerPage(url);
    }).on('pageinit', '#' + PDF_VIEWER_PAGE_ID, function() {
      var url = this.getAttribute('data-url').replace(/(.*?)link=/g, '');
      Application.initPDFViewerPage(url);
    }).on(
        'pageinit',
        '#' + EXPLORER_VIEWER_PAGE_ID,
        function() {
          var categParent = this.getAttribute('data-url').replace(
              /(.*?)parent=/g, '');
          if (categParent.indexOf(EXPLORER_PAGE_NAME) !== -1) {
            categParent = '';
          }
          Application.initListExplorerPage(categParent);
        })
		.on('pageinit','#' + DISCUSSION_VIEWER_PAGE_ID,function() {Application.initDiscussionPage();})
		.on('pageinit','#' + DISCUSSION_ANSWER_VIEWER_PAGE_ID,function(event) {Application.initDiscussionDetailPage();});
		
    Application.openLinksInApp();
    if (window.localStorage.getItem(INSTALLATION_CHECK_VALUE) != undefined) {
      Application.initListIndexPage();
    }

    $("#" + HOME_PAGE_REFRESH_BTN_ID).click(function() {
      Application.setInstallationValue();
    });
  },

  fail : function(error) {
    console.log("nik-error" + error.code + error.message);
    if (error.message) {
      navigator.notification.alert('Error: ' + error.message);
    }
  },

  callDBFromSDCard : function() {
    var settings = JSON.parse(window.localStorage.getItem("'"
        + SETTING_LOCAL_STORAGE_NAME + "'"));
    sdcardLoc = settings.sdcardLoc;
    window.resolveLocalFileSystemURL("file:///" + sdcardLoc
        + SDCARD_DATABASE_FOLDER_NAME + "/" + DATABASE_NAME,
        AppFile.callCopyDBfromSDcard, Application.fail);
  },

  callCopyDBfromSDcard : function(fileEntry) {
    AppFile.copyDBfromSDcard(fileEntry);
    Application.initListIndexPage(window.location.href);
  },

  callFirstTimeApplicationLaunch : function() {
    // Single folder selector
    $.mobile.loading('show');
    window.OurCodeWorld.Filebrowser.folderPicker.single({
      success : function(data) {
        if (!data.length) {
          // No folders selected
          window.location.href = SETTING_PAGE_NAME;
          return;
        }
        var filePath = data[0].replace("file:///", "") + "/";
        var settings = {
          "sdcardLoc" : filePath
        };
        window.localStorage.setItem("'" + SETTING_LOCAL_STORAGE_NAME + "'",
            JSON.stringify(settings));
        // Copy database from SDCard
        Application.callDBFromSDCard();
        // Array with paths
        // ["file:///storage/emulated/0/360/security",
        // "file:///storage/emulated/0/360/security"]
      },
      error : function(err) {
        console.log(err);
      }
    });
  },

  callClearCache : function() {
    // Clear cache button code
    var settings = JSON.parse(window.localStorage.getItem("'"
        + SETTING_LOCAL_STORAGE_NAME + "'"));
    sdcardLoc = settings.sdcardLoc;
    app.db = window.sqlitePlugin.openDatabase({
      name : DATABASE_NAME,
      location : 'default'
    });
    app.prepareCacheTables();
    window.resolveLocalFileSystemURL("file:///" + sdcardLoc,
        Application.addFileEntry, Application.fail);
    // Application.setInstallationValue();
    $.mobile.loading('hide');
  },

  initSettingsPage : function() {
    if (sdcardLoc) {
      $("#" + SETTING_PAGE_SDCARD_LOCATION_TEXT_BOX_ID).val(sdcardLoc);
    }

    $("#btnFolderBrowser").click(
        function() {
          window.OurCodeWorld.Filebrowser.folderPicker.single({
            success : function(data) {
              if (!data.length) {
                return;
              }
              $("#" + SETTING_PAGE_SDCARD_LOCATION_TEXT_BOX_ID).val(
                  data[0].replace("file:///", "") + "/");
              // Array with paths
              // ["file:///storage/emulated/0/360/security",
              // "file:///storage/emulated/0/360/security"]
            },
            error : function(err) {
              console.log(err);
            }
          });
        });

    $("#copyDBtoSDcard").click(
        function() {
          // console.log("droidbase: in copyDBtoSDcard");
          // /data/data/com.technikh.eschooltogo/databases
          // console.log("droidbase:
          // "+cordova.file.applicationStorageDirectory); //
          // file:///data/data/com.technikh.eschooltogo/
          window.resolveLocalFileSystemURL(
              cordova.file.applicationStorageDirectory
                  + APPLICATION_DATABASE_FOLDER_NAME + "/" + DATABASE_NAME,
              AppFile.copyDBtoSDcard, Application.fail);
        });

		$("#copyDBfromSDcard").click(
        function() {
          // console.log("droidbase: in copyDBfromSDcard");
          var settings = JSON.parse(window.localStorage.getItem("'"
              + SETTING_LOCAL_STORAGE_NAME + "'"));
          sdcardLoc = settings.sdcardLoc;
          // console.log("nik-success sdcardLoc"+sdcardLoc);
          window.resolveLocalFileSystemURL("file:///" + sdcardLoc
              + SDCARD_DATABASE_FOLDER_NAME + "/" + DATABASE_NAME,
              AppFile.copyDBfromSDcard, Application.fail);
        });

		$("#clearCacheBtn").click(
        function() {
          // console.log("droidsung: in clearCacheBtn nik-" +
          // cordova.file.externalRootDirectory);
          var settings = JSON.parse(window.localStorage.getItem("'"
              + SETTING_LOCAL_STORAGE_NAME + "'"));
          sdcardLoc = settings.sdcardLoc;

          // console.log("droidsung: before openDatabase");
          app.db = window.sqlitePlugin.openDatabase({
            name : DATABASE_NAME,
            location : 'default'
          });
          // console.log("droidsung: after openDatabase");
          app.prepareCacheTables();

          window.resolveLocalFileSystemURL("file:///" + sdcardLoc,
              Application.addFileEntry, Application.fail);
          window.localStorage.setItem(INSTALLATION_CHECK_VALUE, true);
        });
 
 $('#settings-form').submit(
        function(event) {
          event.preventDefault();
          sdcardLoc = $("#" + SETTING_PAGE_SDCARD_LOCATION_TEXT_BOX_ID).val()
              .trim();
          var settings = {
            "sdcardLoc" : sdcardLoc
          };
          window.localStorage.setItem("'" + SETTING_LOCAL_STORAGE_NAME + "'",
              JSON.stringify(settings));
          navigator.notification.alert('Settings saved.');
        });
  },

  addFileEntry : function(entry) {
    // console.log("nik- in addFileEntry");
    $.mobile.loading('show');
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
                  Application.addFileEntry(entries[i], count);
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
                  if (entries[i].name.endsWith(".yaml")
                      && (entries[i].name.substring(0, 1) != '.')) {
                    // console.log("dbase mdFileFullPath first char: **" +
                    // entries[i].name.substring(0,1) + "^^");
                    var mdFileFullPath = entries[i].fullPath;
                    // mdFileFullPath:
                    // /storage/extSdCard/eschool2go/_videos/Khan
                    // Academy/math/algebra/algebra-functions/analyzing-functions-alg1/_01wqwsb66E.md
                    // console.log("addFileEntry: mdFileFullPath: " +
                    // mdFileFullPath);

                    // TODO: For some reason, simulator needs 'mnt/sdcard'
                    // console.log("addFileEntry: 'file:///' + 'mnt/sdcard' +
                    // mdFileFullPath " + 'file:///' + 'mnt/sdcard' +
                    // mdFileFullPath);

                    // Check for the file.
                    window
                        .resolveLocalFileSystemURL('file:///' + mdFileFullPath,
                            AppFile.mdFileParse, Application.fail);
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
              if (window.location.href.indexOf(HOME_PAGE_NAME) !== -1) {
              } else {
                $("#results").append(fileStr);
              }
              $.mobile.loading('hide');
            }, Application.fail);
  },

  setInstallationValue : function() {
    // add this directory's contents to the status
    $.mobile.loading('show');
    window.localStorage.setItem(INSTALLATION_CHECK_VALUE, true);
    if (window.location.href.indexOf(HOME_PAGE_NAME) !== -1) {
      Application.initListIndexPage(window.location.href);
    }
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
  },

  isDBExists : function() {
    try {
      app.db = window.sqlitePlugin.openDatabase({
        name : DATABASE_NAME,
        location : 'default'
      });
      app.db.transaction(function(tx) {
        tx.executeSql("select * from cache_video_files", [], function(tx, res) {
          return true;
        }, function(err) {
          return false;
        });
      });
      return false;
    } catch (err) {
      return false;
    }
  },
  
  initListExplorerPage : function(categParent, listview_id) {
    app.db = window.sqlitePlugin.openDatabase({
      name : DATABASE_NAME,
      location : 'default'
    });
    // console.log("initListExplorerPage: categParent"+categParent)
    if (categParent == '') {
      app.db.transaction(function(transaction) {
        transaction.executeSql(
            "SELECT cache_yaml_files.* FROM cache_yaml_files", [], function(tx,
                results) {
              var listItemsObj = {};
              var len = results.rows.length, i;
              for (i = 0; i < len; i++) {
                var filePathWithOutExt = results.rows.item(i).unified_path;
                var path_array = filePathWithOutExt.split("/");
                var root_folder = path_array[0];
                listItemsObj[root_folder] = {
                  "isFile" : false,
                  "name" : root_folder
                };
              }
              listview_id = typeof listview_id !== 'undefined' ? listview_id
                  : EXPLORER_LISTVIEW_ID;
              var hyphened_categParent = 'root';
              $('#' + listview_id).attr("id",
                  listview_id + "-" + hyphened_categParent);
              // console.log("initListExplorerPage: listview_id "+listview_id);
              var $contentsList = $('#' + listview_id + '-'
                  + hyphened_categParent);
              // console.log($contentsList);
              $.each(listItemsObj, function(i, el) {
                var htmlItems = '<li><a href="explorer.html?parent=' + i + '">'
                    + el.name + '</a></li>';
                // console.log("initListExplorerPage: " + htmlItems);
                $contentsList.append(htmlItems);
              });
              $contentsList.listview('refresh');
              $.mobile.loading('hide');
            }, null);
      });
    } else {
      listview_id = typeof listview_id !== 'undefined' ? listview_id
          : EXPLORER_LISTVIEW_ID;
      var hyphened_categParent = categParent.replace(/\//g, '-');
      hyphened_categParent = hyphened_categParent.replace(/\s+/g, '-');
      console
          .log('initListExplorerPage: listview_id+"-" + hyphened_categParent '
              + listview_id + "-" + hyphened_categParent);
      $('#' + listview_id).attr("id", listview_id + "-" + hyphened_categParent);
      var $contentsList = $('#' + listview_id + '-' + hyphened_categParent);

      // _media_assets/en.m.wikipedia.org/wiki/Animal\ product.html
      // var htmlItems = '<li><a href="webviewer.html">1my webviewer.html PDF
      // 3</a></li>';
      /*
       * var htmlItems = '<li><a
       * href="webviewer.html?link=file:///storage/sdcard1/Downloads/eschool-android-sdcard/eschool2go/_media_assets/en.m.wikipedia.org/wiki/Animal%20product.html">web1
       * %20</a></li>'; $contentsList.append(htmlItems).listview('refresh');
       * 
       * htmlItems = '<li><a
       * href="webviewer.html?link=file:///storage/sdcard1/Downloads/eschool-android-sdcard/eschool2go/_media_assets/en.m.wikipedia.org/wiki/Animal
       * product.html">web2</a></li>';
       * $contentsList.append(htmlItems).listview('refresh');
       * 
       * $contentsList.listview('refresh');
       */

      try {
        app.db
            .transaction(function(transaction) {
              transaction
                  /*
                   * .executeSql( "SELECT cache_video_files.*,
                   * cache_yaml_files.display_name, cache_image_files.name AS
                   * image_file_name FROM cache_video_files LEFT JOIN
                   * cache_yaml_files ON cache_video_files.path =
                   * cache_yaml_files.path LEFT JOIN cache_image_files ON
                   * cache_video_files.path = cache_image_files.path WHERE
                   * cache_video_files.path LIKE '" + categParent + "/%'", [],
                   */
                  .executeSql(
                      "SELECT cache_yaml_files.* FROM cache_yaml_files WHERE cache_yaml_files.unified_path LIKE '"
                          + categParent + "%'",
                      [],
                      function(tx, results) {
                        console.log(JSON.stringify(results));
                        var len = results.rows.length, i;
                        console
                            .log("initListExplorerPage: len = results.rows.length"
                                + len)
                        var listItemsObj = {}
                        for (i = 0; i < len; i++) {
                          var filePathWithOutExt = results.rows.item(i).unified_path;
                          var filePathWithExt = filePathWithOutExt + "."
                              + results.rows.item(i).extension;
                          var filePathArray = filePathWithExt.split("/");
                          var categParentNumOfSlashes = (categParent.split("/").length - 1);
                          var filePathNumOfSlashes = (filePathArray.length - 1);
                          var listItemName = filePathArray[1 + categParentNumOfSlashes];
                          if (filePathNumOfSlashes == (categParentNumOfSlashes + 1)) {
                            listItemsObj[listItemName] = {
                              "isFile" : true,
                              "ext" : results.rows.item(i).extension,
                              "type" : results.rows.item(i).type,
                              "offline_file" : results.rows.item(i).offline_file,
                              "name" : results.rows.item(i).display_name,
                              "image" : results.rows.item(i).image_file_name
                            };
                          } else {
                            listItemsObj[listItemName] = {
                              "isFile" : false,
                              "name" : listItemName
                            };
                          }
                        }
                        if (categParent) {
                          categParent = categParent + '/';
                        }
                        console.log("initListExplorerPage: listItemsObj "
                            + JSON.stringify(listItemsObj));
                        // If length of listItemsObj is 1 and not file
                        console.log("initListExplorerPage: listItemsObj length"
                            + Object.keys(listItemsObj).length);
                        console
                            .log("initListExplorerPage: Object.keys(listItemsObj) "
                                + JSON.stringify(Object.keys(listItemsObj)[0]));
                        if (Object.keys(listItemsObj).length == 1
                            && !Object.keys(listItemsObj)[0].endsWith(".yaml")) {
                          console
                              .log("initListExplorerPage: Object.values(listItemsObj) "
                                  + JSON
                                      .stringify(Object.keys(listItemsObj)[0]));
                          var folderMultiPathArray = [];
                          var minimum_length = 100;
                          for (i = 0; i < len; i++) {
                            // English/Textbooks/India/Telangana/SSC/Biology/2.
                            // Respiration -
                            // English/Textbooks/India/Telangana/SSC/Biology/1.
                            // Nutrition -
                            // English/Textbooks/India/Telangana/SSC/Physics/1.
                            // Heat -
                            // categParent: English/Textbooks
                            var filePathWithOutExt = results.rows.item(i).unified_path;
                            // Remove categParent
                            var folderPath = filePathWithOutExt
                                .substring(categParent.length);
                            console.log("initListExplorerPage: folderPath "
                                + folderPath);
                            // Remove file name
                            var folderPathArray = folderPath.split("/");
                            folderPathArray.pop()
                            folderMultiPathArray.push(folderPathArray);
                            if (folderPathArray.length < minimum_length) {
                              minimum_length = folderPathArray.length;
                            }
                            console
                                .log("initListExplorerPage: filePathWithOutExt unified_path "
                                    + filePathWithOutExt);
                          }
                          console
                              .log("initListExplorerPage: folderMultiPathArray "
                                  + JSON.stringify(folderMultiPathArray));
                          var matchingComponentArray = [];
                          console.log("initListExplorerPage: minimum_length "
                              + minimum_length);
                          for (i = 0; i < minimum_length; i++) {
                            var matching_component = folderMultiPathArray[0][i];
                            var is_matched = true;
                            console
                                .log("initListExplorerPage: matching_component "
                                    + matching_component);
                            for (var j = 1; j < folderMultiPathArray.length; j++) {
                              console
                                  .log("initListExplorerPage: j i folderMultiPathArray[j][i] "
                                      + j + i + folderMultiPathArray[j][i]);
                              if (folderMultiPathArray[j][i] != matching_component) {
                                is_matched = false;
                              }
                            }
                            if (is_matched == true) {
                              matchingComponentArray.push(matching_component);
                            }
                          }
                          console
                              .log("initListExplorerPage: matchingComponentArray "
                                  + JSON.stringify(matchingComponentArray));
                          var listItemsObj = {}
                          listItemsObj[matchingComponentArray.join('/')] = {
                            "isFile" : false,
                            "name" : matchingComponentArray.join(' -> ')
                          };
                        }
                        $
                            .each(
                                listItemsObj,
                                function(i, el) {
                                  if (el.isFile == true) {
                                    var file_display_name = i;
                                    if (el.name) {
                                      file_display_name = el.name;
                                    }
                                    var image_html = '';
                                    if (el.image) {
                                      image_html = '<img width="230px" src="file:///'
                                          + sdcardLoc
                                          + categParent
                                          + el.image
                                          + '" />';
                                    }
                                    if (el.type && (el.type == "video")) {
                                      console.log("initListExplorerPage: el "
                                          + JSON.stringify(el));
                                      console
                                          .log("initListExplorerPage: el.type 1"
                                              + el.type);
                                      console
                                          .log("initListExplorerPage: el.offline_file "
                                              + el.offline_file);
                                      console
                                          .log("initListExplorerPage: el.offline_file.trim()"
                                              + el.offline_file.trim());
                                      // check for video file webm or mp4 or mkv
                                      // _videos folder
                                      // replace space with %20
                                      // http://android.stackexchange.com/questions/4775/how-can-i-open-an-html-file-i-have-copied-from-pc-to-sd-card-of-phone
                                      // %20 or whole string in quotes
                                      // "/mnt/sdcard/Documents/To Read.html"
                                      var opener_file_url = sdcardLoc
                                          + '_videos/' + categParent
                                          + el.offline_file.trim();
                                      opener_file_url = encodeURIComponent(opener_file_url);
                                      // opener_file_url =
                                      // opener_file_url.replace(/\s+/g, '%20');
                                      var htmlItems = '<li>'
                                          + image_html
                                          + '<span onclick="window.plugins.fileOpener.open(\'file:///'
                                          + opener_file_url + '\')">'
                                          + file_display_name + '</span></li>';
                                      console.log("initListExplorerPage: "
                                          + htmlItems);
                                    } else if (el.type
                                        && (el.type == "article")) {
                                      console.log("rahul: el "
                                          + JSON.stringify(el));
                                      console.log("rahul: el.type 1" + el.type);
                                      console.log("rahul: el.offline_file "
                                          + el.offline_file);
                                      console
                                          .log("rahul: el.offline_file.trim()"
                                              + el.offline_file.trim());
                                      // check for video file webm or mp4 or mkv
                                      // _videos folder
                                      // replace space with %20
                                      // http://android.stackexchange.com/questions/4775/how-can-i-open-an-html-file-i-have-copied-from-pc-to-sd-card-of-phone
                                      // %20 or whole string in quotes
                                      // "/mnt/sdcard/Documents/To Read.html"
                                      var opener_file_url = sdcardLoc
                                          + '_articles/' + categParent
                                          + el.offline_file.trim();
                                      //opener_file_url = opener_file_url.replace(/\s+/g, '%20');
                                      var htmlItems = '<li><a href="pdfviewer.html?link=file:///'
                                          + opener_file_url
                                          + '">'
                                          + file_display_name + '</a></li>';
                                      console.log("rahul: " + htmlItems);
                                    } else {
                                      // unknown file type
                                      var htmlItems = '<li>'
                                          + image_html
                                          + '<span onclick="window.plugins.fileOpener.open(\'file:///'
                                          + sdcardLoc + categParent + i
                                          + '\')">' + file_display_name
                                          + '</span></li>';
                                    }
                                  } else {
                                    var htmlItems = '<li><a href="explorer.html?parent='
                                        + categParent
                                        + i
                                        + '">'
                                        + el.name
                                        + '</a></li>';
                                  }
                                  console.log("initListExplorerPage: "
                                      + htmlItems);
                                  $contentsList.append(htmlItems);
                                });
                        $contentsList.listview('refresh');
                        $.mobile.loading('hide');
                      }, null);
            });
      } catch (err) {
        console.log(err);
        if (navigator.notification) {
          navigator.notification.alert('Error: ' + err);
        }
        return false;
      }
    }
  },
  
  initListIndexPage : function(categParent) {
    if (!categParent || (categParent.indexOf(HOME_PAGE_NAME) !== -1)) {
      categParent = VIDEO_FOLDER_NAME;
    }
    categParent = '';
    Application.initListExplorerPage(categParent, 'index-contents-list');
  },
  
  initDiscussionPage : function() {
		GAPageLoad();
		app.prepareDiscusssionTables(LoadData);

		function GAPageLoad()
		{
			try {
				_gaq.push([GA_NAME_PAGE_LOAD, GA_ID_PAGE_LOAD]);
				if ($.mobile.activePage.attr("data-url")) {
					_gaq.push(['_trackPageview', $.mobile.activePage.attr("data-url")]);
				} else {
					_gaq.push(['_trackPageview']);
				}
			} catch(err) { console.log(err);}
		}
	
		function GAAddQuestion()
		{
			try {
				_gaq.push([GA_NAME_ADD_QUESTION, GA_ID_ADD_QUESTION]);
				if ($.mobile.activePage.attr("data-url")) {
					_gaq.push(['_trackPageview', $.mobile.activePage.attr("data-url")]);
				} else {
					_gaq.push(['_trackPageview']);
				}
			} catch(err) { console.log(err);}
		}
		
		$('#ask-form').submit(
			function(event) {
			  app.db = window.sqlitePlugin.openDatabase({
				name : DATABASE_NAME,
				location : 'default'
			  });
			  var askValue = $('textarea#question').val();
			  var title = $('input#questionTitle').val();
			  app.insertDiscussionPoints(title,askValue,LoadData);
			  $('textarea#question').val('');
			  $('input#questionTitle').val('');
			   navigator.notification.alert('Your question saved sucessfully.');
			   GAAddQuestion();
			}
		);

		function LoadData()
		{
			LoadData('');
		}
		
		function ActivateFilterButton(id)
		{
			$('#btnRecentlyPosted').removeClass(ACTIVE_BUTTON_CLASS);
			$('#btnMostLiked').removeClass(ACTIVE_BUTTON_CLASS);
			$('#btnMostDisliked').removeClass(ACTIVE_BUTTON_CLASS);
			$('#btnMostUseful').removeClass(ACTIVE_BUTTON_CLASS);
			$('#btnMostNonUseful').removeClass(ACTIVE_BUTTON_CLASS);
			$('#btnUnanswered').removeClass(ACTIVE_BUTTON_CLASS);
			$('#btnMostAnswered').removeClass(ACTIVE_BUTTON_CLASS);
			$('#btnMostView').removeClass(ACTIVE_BUTTON_CLASS);
			$('#'+id).addClass(ACTIVE_BUTTON_CLASS);
		}
		
		$('#'+DISCUSSION_POPUP_FILTER_ID).on('click', '.'+DISCUSSION_FILTER_RECENT_POSTED, function() {
			LoadData(DISCUSSION_FILTER_RECENT_POSTED);
			var btnId = $(this).attr('id');
			ActivateFilterButton(btnId);
			$('#'+DISCUSSION_POPUP_FILTER_ID).popup("close");
		});
		
		$('#'+DISCUSSION_POPUP_FILTER_ID).on('click', '.'+DISCUSSION_FILTER_MOST_LIKED, function() {
			LoadData(DISCUSSION_FILTER_MOST_LIKED);
			var btnId = $(this).attr('id');
			ActivateFilterButton(btnId);
			
			$('#'+DISCUSSION_POPUP_FILTER_ID).popup("close");
		});
		
		$('#'+DISCUSSION_POPUP_FILTER_ID).on('click', '.'+DISCUSSION_FILTER_MOST_DISLIKED, function() {
			LoadData(DISCUSSION_FILTER_MOST_DISLIKED);
			var btnId = $(this).attr('id');
			ActivateFilterButton(btnId);
			$('#'+DISCUSSION_POPUP_FILTER_ID).popup("close");
		});
		
		$('#'+DISCUSSION_POPUP_FILTER_ID).on('click', '.'+DISCUSSION_FILTER_UN_ANSWERED, function() {
			LoadData(DISCUSSION_FILTER_UN_ANSWERED);
			var btnId = $(this).attr('id');
			ActivateFilterButton(btnId);
			$('#'+DISCUSSION_POPUP_FILTER_ID).popup("close");
		});
		
		$('#'+DISCUSSION_POPUP_FILTER_ID).on('click', '.'+DISCUSSION_FILTER_MOST_ANSWERED, function() {
			LoadData(DISCUSSION_FILTER_MOST_ANSWERED);
			var btnId = $(this).attr('id');
			ActivateFilterButton(btnId);
			$('#'+DISCUSSION_POPUP_FILTER_ID).popup("close");
		});
		
		$('#'+DISCUSSION_POPUP_FILTER_ID).on('click', '.'+DISCUSSION_FILTER_MOST_USEFUL, function() {
			LoadData(DISCUSSION_FILTER_MOST_USEFUL);
			var btnId = $(this).attr('id');
			ActivateFilterButton(btnId);
			$('#'+DISCUSSION_POPUP_FILTER_ID).popup("close");
		});

		$('#'+DISCUSSION_POPUP_FILTER_ID).on('click', '.'+DISCUSSION_FILTER_MOST_NON_USEFUL, function() {
			LoadData(DISCUSSION_FILTER_MOST_NON_USEFUL);
			var btnId = $(this).attr('id');
			ActivateFilterButton(btnId);
			$('#'+DISCUSSION_POPUP_FILTER_ID).popup("close");
		});
		
		$('#'+DISCUSSION_POPUP_FILTER_ID).on('click', '.'+DISCUSSION_FILTER_MOST_VIEW, function() {
			LoadData(DISCUSSION_FILTER_MOST_VIEW);
			var btnId = $(this).attr('id');
			ActivateFilterButton(btnId);
			$('#'+DISCUSSION_POPUP_FILTER_ID).popup("close");
		});
		
		$('#'+DISCUSS_LISTVIEW_ID).on('click', '.answer', function() {
			var btnId = $(this).attr('id');
			var discussionId = btnId.replace('btnDisAnswer','');
			GLOBAL_CURRENT_QUE_ID = discussionId;
			$.mobile.changePage("discussAnswer.html",{transition:"pop",changeHash:true});
		});

		function LoadData(filterByPar){
			$.mobile.loading('show');	
			app.db = window.sqlitePlugin.openDatabase({
			  name : DATABASE_NAME,
			  location : 'default'
			});
			app.db.transaction(function(transaction) {
			
			var filterBy = filterByPar;
			
			var query = "SELECT discussion_points.* FROM discussion_points";
			switch(filterBy) {
				case DISCUSSION_FILTER_RECENT_POSTED:
					query = "SELECT discussion_points.* FROM discussion_points ORDER BY Id Desc";
					break;
				case DISCUSSION_FILTER_MOST_LIKED:
					query = "SELECT dp.*,dplike.CountLike,dpdislike.CountDislike,dpblank.CountBlank FROM discussion_points dp "
							+ "LEFT JOIN  (SELECT COUNT(LikeDisLike) as 'CountLike',Discussion_Point_Id From discussion_points_likedislike WHERE LikeDisLike = '"+DISCUSSION_LIKE_VALUE+"' GROUP BY Discussion_Point_Id ) dplike on dp.Id = dplike.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(LikeDisLike) as 'CountDislike',Discussion_Point_Id From discussion_points_likedislike WHERE LikeDisLike = '"+DISCUSSION_DISLIKE_VALUE+"' GROUP BY Discussion_Point_Id ) dpdislike on dp.Id = dpdislike.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(LikeDisLike) as 'CountBlank',Discussion_Point_Id From discussion_points_likedislike WHERE LikeDisLike = '' OR LikeDisLike IS NULL GROUP BY Discussion_Point_Id ) dpblank on dp.Id = dpblank.Discussion_Point_Id "
							+ "ORDER BY  dplike.CountLike Desc,dpdislike.CountDislike Desc,dpblank.CountBlank Desc";
					break;
				case DISCUSSION_FILTER_MOST_DISLIKED:
						query = "SELECT dp.*,dplike.CountLike,dpdislike.CountDislike,dpblank.CountBlank FROM discussion_points dp "
							+ "LEFT JOIN  (SELECT COUNT(LikeDisLike) as 'CountLike',Discussion_Point_Id From discussion_points_likedislike WHERE LikeDisLike = '"+DISCUSSION_LIKE_VALUE+"' GROUP BY Discussion_Point_Id) dplike on dp.Id = dplike.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(LikeDisLike) as 'CountDislike',Discussion_Point_Id From discussion_points_likedislike WHERE LikeDisLike = '"+DISCUSSION_DISLIKE_VALUE+"' GROUP BY Discussion_Point_Id) dpdislike on dp.Id = dpdislike.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(LikeDisLike) as 'CountBlank',Discussion_Point_Id From discussion_points_likedislike WHERE LikeDisLike = '' OR LikeDisLike IS NULL GROUP BY Discussion_Point_Id) dpblank on dp.Id = dpblank.Discussion_Point_Id "
							+ "ORDER BY  dpdislike.CountDislike Desc,dplike.CountLike Desc,dpblank.CountBlank Desc";
					break;
					
				case DISCUSSION_FILTER_MOST_USEFUL:
					query = "SELECT dp.*,dpuseful.CountUseful,dpnonuseful.CountNonUseful,dpblank.CountBlank FROM discussion_points dp "
							+ "LEFT JOIN  (SELECT COUNT(UserfulNonUseful) as 'CountUseful',Discussion_Point_Id From discussion_points_usefulnonuseful WHERE UserfulNonUseful = '"+DISCUSSION_USEFUL_VALUE+"' GROUP BY Discussion_Point_Id) dpuseful on dp.Id = dpuseful.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(UserfulNonUseful) as 'CountNonUseful',Discussion_Point_Id From discussion_points_usefulnonuseful WHERE UserfulNonUseful = '"+DISCUSSION_NONUSEFUL_VALUE+"' GROUP BY Discussion_Point_Id) dpnonuseful on dp.Id = dpnonuseful.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(UserfulNonUseful) as 'CountBlank',Discussion_Point_Id From discussion_points_usefulnonuseful WHERE UserfulNonUseful = '' OR UserfulNonUseful IS NULL GROUP BY Discussion_Point_Id) dpblank on dp.Id = dpblank.Discussion_Point_Id "
							+ "ORDER BY  dpuseful.CountUseful Desc,dpnonuseful.CountNonUseful Desc,dpblank.CountBlank Desc";
					break;
					
				case DISCUSSION_FILTER_MOST_NON_USEFUL:
						query = "SELECT dp.*,dpuseful.CountUseful,dpnonuseful.CountNonUseful,dpblank.CountBlank FROM discussion_points dp "
							+ "LEFT JOIN  (SELECT COUNT(UserfulNonUseful) as 'CountUseful',Discussion_Point_Id From discussion_points_usefulnonuseful WHERE UserfulNonUseful = '"+DISCUSSION_USEFUL_VALUE+"' GROUP BY Discussion_Point_Id) dpuseful on dp.Id = dpuseful.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(UserfulNonUseful) as 'CountNonUseful',Discussion_Point_Id From discussion_points_usefulnonuseful WHERE UserfulNonUseful = '"+DISCUSSION_NONUSEFUL_VALUE+"' GROUP BY Discussion_Point_Id) dpnonuseful on dp.Id = dpnonuseful.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(UserfulNonUseful) as 'CountBlank',Discussion_Point_Id From discussion_points_usefulnonuseful WHERE UserfulNonUseful = '' OR UserfulNonUseful IS NULL  GROUP BY Discussion_Point_Id) dpblank on dp.Id = dpblank.Discussion_Point_Id "
							+ "ORDER BY  dpnonuseful.CountNonUseful Desc,dpuseful.CountUseful Desc,dpblank.CountBlank Desc";
					break;
					
				case DISCUSSION_FILTER_UN_ANSWERED:
						query = "SELECT dp.*,dpunanswer.Answer FROM discussion_points dp "
							+ "LEFT JOIN  (SELECT * From discussion_points_answer ) dpunanswer on dp.Id = dpunanswer.Discussion_Point_Id "
							+" WHERE dpunanswer.Answer is null "
							+ "ORDER BY dp.Id Desc";
					break;
				
				case DISCUSSION_FILTER_MOST_ANSWERED:
						query = "SELECT dp.*,dpanswer.CountAnswer,dpunanswer.CountUnanswer FROM discussion_points dp "
							+ "LEFT JOIN  (SELECT COUNT(Answer) as 'CountAnswer',Discussion_Point_Id From discussion_points_answer WHERE Answer != '' AND Answer IS NOT NULL GROUP BY Discussion_Point_Id) dpanswer on dp.Id = dpanswer.Discussion_Point_Id "
							+ "LEFT JOIN  (SELECT COUNT(Answer) as 'CountUnanswer',Discussion_Point_Id From discussion_points_answer WHERE Answer = '' OR Answer IS NULL GROUP BY Discussion_Point_Id) dpunanswer on dp.Id = dpunanswer.Discussion_Point_Id "
							+ "ORDER BY  dpanswer.CountAnswer Desc,dpunanswer.CountUnanswer Desc";
					break;
				case DISCUSSION_FILTER_MOST_VIEW:
						query = "SELECT dp.*,dpv.CountView FROM discussion_points dp "
								+" LEFT JOIN (SELECT COUNT(Id) as 'CountView',Discussion_Point_Id FROM discussion_points_view  GROUP BY Discussion_Point_Id) as dpv  on dpv.Discussion_Point_Id = dp.Id "
								+" ORDER BY  dpv.CountView Desc"
					break;
			}
		
        transaction.executeSql(
            query, [], function(tx,
			results) {
			  var listItemsObj = {};
			  var len = results.rows.length, i;
			  $("#"+DISCUSS_LISTVIEW_ID).empty();
			  for (i = 0; i < len; i++) {
			  var discussionTitle = results.rows.item(i).Discussion_Title_Point;
				var discussionDescription = results.rows.item(i).Discussion_Point;
				var discussionAnswer = results.rows.item(i).Answer;
				var discussionId = results.rows.item(i).Id;
				
				if(discussionDescription != "")
				{
					var likeActiveClass = (discussionAnswer  == DISCUSSION_LIKE_VALUE ? ACTIVE_BUTTON_CLASS : "");
					var dislikeActiveClass = (discussionAnswer  == DISCUSSION_DISLIKE_VALUE ? ACTIVE_BUTTON_CLASS : "");
					var content = "<li id="+discussionId+" ><div data-role='collapsible' id='set" + discussionId + "'><h3>" + discussionTitle 
										+ "</h3><p>"+discussionDescription 
										+ "</p>"
										+"<form>"
										+"<a href='#' data-inline='true' data-role='button' class='answer ' id='btnDisAnswer"+discussionId+"'>Answer</a>"
										+"</form>"
										+"<div id='answerDiv" + discussionId + "'+></div></div></li>";
						$("#"+DISCUSS_LISTVIEW_ID).append(content);
				}	
				}
				$("#"+DISCUSS_LISTVIEW_ID).trigger("create");
				
				$.mobile.loading('hide');	   
				},null);});
		}
	},
	
  initDiscussionDetailPage : function() {
	  
	  
	  LoadDiscussionDetailData();
	  
	    function LoadDiscussionDetailData()
		{
			var questionId = GLOBAL_CURRENT_QUE_ID; 
			
			app.countDiscussionLikeDisLike(questionId,DISCUSSION_LIKE_VALUE,UpdateLikeCount);
			app.countDiscussionLikeDisLike(questionId,DISCUSSION_DISLIKE_VALUE,UpdateDislikeCount);
			app.countDiscussionUsefulNonUseful(questionId,DISCUSSION_USEFUL_VALUE,UpdateUsefulCount);
			app.countDiscussionUsefulNonUseful(questionId,DISCUSSION_NONUSEFUL_VALUE,UpdateNonUsefulCount);
			
			$.mobile.loading('show');	
			app.db = window.sqlitePlugin.openDatabase({
			  name : DATABASE_NAME,
			  location : 'default'
			});
			app.db.transaction(function(transaction) {
			
			var filterBy = '';
			
			var query = "SELECT * FROM discussion_points WHERE Id = '"+GLOBAL_CURRENT_QUE_ID+"'";
			
			
			transaction.executeSql(
            query, [], function(tx,
			results) {

				var discussionId = results.rows.item(0).Id;
				var discussionTitle = results.rows.item(0).Discussion_Title_Point;
				var discussionDescription = results.rows.item(0).Discussion_Point;

				$("#discussionTitle").html(discussionTitle);
				$("#discussionDescription").html(discussionDescription);
				
				//var answerQuery = "SELECT * FROM discussion_points_answer WHERE Discussion_Point_Id = '"+GLOBAL_CURRENT_QUE_ID+"'";	
				LoadAnswerList();
				
			},null);});
		};
		
		function LoadAnswerList()
		{
			$.mobile.loading('show');
			var answerQuery = "SELECT dpa.*,dpalike.CountLike,dpadislike.CountDisLike,dpauseful.CountUseful,dpanonuseful.CountNonUseful FROM discussion_points_answer dpa"
									+" LEFT JOIN  (SELECT COUNT(LikeDisLike) as 'CountLike',Discussion_Point_Answer_Id From discussion_points_answer_likedislike WHERE LikeDisLike = '"+DISCUSSION_LIKE_VALUE+"' GROUP BY Discussion_Point_Answer_Id ) dpalike on dpa.Id = dpalike.Discussion_Point_Answer_Id "
									+" LEFT JOIN  (SELECT COUNT(LikeDisLike) as 'CountDisLike',Discussion_Point_Answer_Id From discussion_points_answer_likedislike WHERE LikeDisLike = '"+DISCUSSION_DISLIKE_VALUE+"' GROUP BY Discussion_Point_Answer_Id ) dpadislike on dpa.Id = dpadislike.Discussion_Point_Answer_Id "
									+" LEFT JOIN  (SELECT COUNT(UserfulNonUseful) as 'CountUseful',Discussion_Point_Answer_Id From discussion_points_answer_usefulnonuseful WHERE UserfulNonUseful = '"+DISCUSSION_USEFUL_VALUE+"' GROUP BY Discussion_Point_Answer_Id ) dpauseful on dpa.Id = dpauseful.Discussion_Point_Answer_Id "
									+" LEFT JOIN  (SELECT COUNT(UserfulNonUseful) as 'CountNonUseful',Discussion_Point_Answer_Id From discussion_points_answer_usefulnonuseful WHERE UserfulNonUseful = '"+DISCUSSION_NONUSEFUL_VALUE+"' GROUP BY Discussion_Point_Answer_Id ) dpanonuseful on dpa.Id = dpanonuseful.Discussion_Point_Answer_Id "
									+" WHERE Discussion_Point_Id = '"+GLOBAL_CURRENT_QUE_ID+"'";

				app.db = window.sqlitePlugin.openDatabase({
			  name : DATABASE_NAME,
			  location : 'default'
			});
			app.db.transaction(function(transaction) {
			
			transaction.executeSql(
				answerQuery, [], function(tx,
				answerResults) {
				
					var len = answerResults.rows.length, i;
					
					  $("#"+DISCUSS_ANSWER_LISTVIEW_ID).empty();
					  for (i = 0; i < len; i++) {
						  
						var answerId = answerResults.rows.item(i).Id;
						var answer = answerResults.rows.item(i).Answer;
						var likeCount = answerResults.rows.item(i).CountLike;
						var disLikeCount = answerResults.rows.item(i).CountDisLike;
						var usefulCount = answerResults.rows.item(i).CountUseful;
						var nonUsefulCount = answerResults.rows.item(i).CountNonUseful;
						
						if(answer == 'undefined'){answer = "";}
						if(likeCount == '0' || likeCount == null || likeCount == 'undefined'){likeCount = "0";}
						if(disLikeCount == '0' || disLikeCount == null || disLikeCount == 'undefined' ){disLikeCount = "0";}
					    if(usefulCount == '0' || usefulCount == null || usefulCount == 'undefined'){usefulCount = "0";}
						if(nonUsefulCount == '0' || nonUsefulCount == null || nonUsefulCount == 'undefined'){nonUsefulCount = "0";}
						
						if(answer != '')
						{
							var content = "<li id="+answerId+" ><div data-role='collapsible' id='setAnswer" + answerId + "'><h3>" + answer 
											+ "</h3><p>"+answer 
											+ "</p>"
											+ "<a href='#' data-inline='true' data-role='button' class='Alike ' id='btnALike"+answerId+"'>Like - <span id='lblALikeCount"+answerId+"' class='likeCount'>"+likeCount+"</span></a>"
											+ "<a href='#' data-inline='true' data-role='button' class='Adislike ' id='btnADislike"+answerId+"'>Dislike - <span id='lblADislikeCount"+answerId+"' class='dislikeCount'>"+disLikeCount+"</span></a>"
											+ "<a href='#' data-inline='true' data-role='button' class='Auseful ' id='btnAUseful"+answerId+"'>Useful - <span id='lblAUsefulCount"+answerId+"' class='usefulCount'>"+usefulCount+"</span></a>"
											+ "<a href='#' data-inline='true' data-role='button' class='Anonuseful ' id='btnANonUseful"+answerId+"'>NonUseful  - <span id='lblANonUsefulCount"+answerId+"' class='nonusefulCount'>"+nonUsefulCount+"</span></a>"
											+ "</div></li>";
						
							$("#"+DISCUSS_ANSWER_LISTVIEW_ID).append(content);
						}
					  }
					  $("#"+DISCUSS_ANSWER_LISTVIEW_ID).trigger("create");
					  $.mobile.loading('hide');
				},null);});
		}

		$('#'+DISCUSS_ANSWER_LISTVIEW_ID).on('click', '.Alike', function() {
			var btnId = $(this).attr('id');
			var answerId = btnId.replace('btnALike','');
			app.updateAnswerLikeDislike(answerId,DISCUSSION_LIKE_VALUE);
			app.countAnswerLikeDisLike(answerId,DISCUSSION_LIKE_VALUE,UpdateAnswerLikeCount);
		});
		
		function UpdateAnswerLikeCount(result,answerId)
		{
			$('#lblALikeCount'+answerId).html(result.rows.item(0).Count);
		}
		
		$('#'+DISCUSS_ANSWER_LISTVIEW_ID).on('click', '.Adislike', function() {
			var btnId = $(this).attr('id');
			var answerId = btnId.replace('btnADislike','');
			app.updateAnswerUsefulNonUseful(answerId,DISCUSSION_USEFUL_VALUE);
			app.countAnswerLikeDisLike(answerId,DISCUSSION_DISLIKE_VALUE,UpdateAnswerDisLikeCount);
		});
		
		function UpdateAnswerDisLikeCount(result,answerId)
		{
			$('#lblADislikeCount'+answerId).html(result.rows.item(0).Count);
		}
				
		$('#'+DISCUSS_ANSWER_LISTVIEW_ID).on('click', '.Auseful', function() {
			var btnId = $(this).attr('id');
			var answerId = btnId.replace('btnAUseful','');
			app.updateAnswerLikeDislike(answerId,DISCUSSION_DISLIKE_VALUE);
			app.countAnswerUsefulNonUseful(answerId,DISCUSSION_USEFUL_VALUE,UpdateAnswerUsefulCount);
			
		});
		
		function UpdateAnswerUsefulCount(result,answerId)
		{
			$('#lblAUsefulCount'+answerId).html(result.rows.item(0).Count);
		}
		
		$('#'+DISCUSS_ANSWER_LISTVIEW_ID).on('click', '.Anonuseful', function() {
			var btnId = $(this).attr('id');
			var answerId = btnId.replace('btnANonUseful','');
			app.updateAnswerUsefulNonUseful(answerId,DISCUSSION_NONUSEFUL_VALUE);
			app.countAnswerUsefulNonUseful(answerId,DISCUSSION_NONUSEFUL_VALUE,UpdateAnswerNonUsefulCount);
			
		});
		
		function UpdateAnswerNonUsefulCount(result,answerId)
		{
			$('#lblANonUsefulCount'+answerId).html(result.rows.item(0).Count);
		}

		$('#btndetailDiscussionLike').click(function()
		{
			var discussionId = GLOBAL_CURRENT_QUE_ID;
			app.updateDiscussionLikeDislike(discussionId,DISCUSSION_LIKE_VALUE);
			app.countDiscussionLikeDisLike(discussionId,DISCUSSION_LIKE_VALUE,UpdateLikeCount);
			
		});
		
		function UpdateLikeCount(result)
		{
			$('#lblLikeCount').html(result.rows.item(0).Count);
		}
		
		$('#btndetailDiscussionDislike').click(function()
		{
			var discussionId = GLOBAL_CURRENT_QUE_ID;
			app.updateDiscussionLikeDislike(discussionId,DISCUSSION_DISLIKE_VALUE);
			app.countDiscussionLikeDisLike(discussionId,DISCUSSION_DISLIKE_VALUE,UpdateDislikeCount);
		});
		function UpdateDislikeCount(result)
		{
			$('#lblDisLikeCount').html(result.rows.item(0).Count);
		}
		
		
		$('#btndetailDiscussionUseful').click(function()
		{
			var discussionId = GLOBAL_CURRENT_QUE_ID;
			app.updateDiscussionUsefulNonUseful(discussionId,DISCUSSION_USEFUL_VALUE);
			app.countDiscussionUsefulNonUseful(discussionId,DISCUSSION_USEFUL_VALUE,UpdateUsefulCount);
		});
		
		function UpdateUsefulCount(result)
		{
			$('#lblUsefulCount').html(result.rows.item(0).Count);
		}

		
		$('#btndetailDiscussionNonuseful').click(function()
		{
			var discussionId = GLOBAL_CURRENT_QUE_ID;
			app.updateDiscussionUsefulNonUseful(discussionId,DISCUSSION_NONUSEFUL_VALUE);
			app.countDiscussionUsefulNonUseful(discussionId,DISCUSSION_NONUSEFUL_VALUE,UpdateNonUsefulCount);
		});
		
		function UpdateNonUsefulCount(result)
		{
			$('#lblNonUsefulCount').html(result.rows.item(0).Count);
		}
		
		
	    $(document).on('click', '.answer', function() {
			var answerValue = $('textarea#'+DISCUSSION_ANSWER_TEXTAREA_PREFIX).val();
			if(answerValue != 'undefined' && answerValue != '')
			{
				app.updateDiscussionAnswer(GLOBAL_CURRENT_QUE_ID,answerValue,LoadAnswerList);
			}
			$('textarea#'+DISCUSSION_ANSWER_TEXTAREA_PREFIX).val('');
			$('#popupAnswer').popup("close");
			 navigator.notification.alert('Your answer saved sucessfully.');
		});
	},
	};
