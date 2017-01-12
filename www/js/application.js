var sdcardLoc = '';
var annotationsObject = {};
//var dictionariesObject = {};
var count = 0;
var Application = {
  initWebViewerPage : function(url) {
   // console.log("initWebViewerPage: url " + url);
    // $('#web-view-frame').attr("src", url);
  },
  applyPDFviewerAnnotations : function(iframeSelector) {
    //console.log("adarsh: in applyPDFviewerAnnotations");
    $('div.textLayer div', $(iframeSelector).get(0).contentWindow.document)
    .each(
        function() {
          var contentfull = $(this).html();
         // console.log("adarsh: " + contentfull);
          $.each(annotationsObject, function(i, el) {
           // console.log("bannu : annotationsObject " + i);
            var re = new RegExp(i,"g");
            contentfull = contentfull
            .replace(
                re,
                '<span onclick="pdfAnnotationsViewerApp.onClickOfAnnotationQuote(\''+el.id+'\', \''+el.source_uuid+'\')" style="background:yellow; margin-left: -2px;">'+i+' </span>');
           // console.log("bannu : span onclick " + '<span onclick="pdfAnnotationsViewerApp.onClickOfAnnotationQuote(\''+el.id+'\')" style="');
          });
         // console.log("bannu: " + contentfull);
          $(this).html(contentfull);
        });
  },
  pannelAnnotationMoreHTMLcalculate : function(yaml_file_path, id, offline_file) {
    var opener_file_more_string = '';
    if(yaml_file_path){
      yaml_file_path = yaml_file_path.substring(0, yaml_file_path.lastIndexOf("/")+1);
     // console.log("asa yaml_file_path 2 " + yaml_file_path);
      var opener_file_url = "file:///" + sdcardLoc + yaml_file_path + offline_file;
     // console.log("asa blackie annotations: opener_file_url " + opener_file_url);
      opener_file_more_string = ' <a onclick="pdfAnnotationsViewerApp.onClickOfAnnotationMoreLink(\''
        + opener_file_url + '\')" href="pdfviewer.html?uuid='
        + id
        + '&link='
        + opener_file_url
        + '">'
        + 'More...' + '</a>';
    }
    return opener_file_more_string;
  },
  initPDFViewerPage : function(uuid, url) {
   // console.log("bannu initPDFViewerPage: url " + url);
   // console.log("bannu initPDFViewerPage: uuid " + uuid);

    $('#mypanel').attr("id", 'pdf-panel-'+uuid);
    $('#btn-panel-options').attr("id", 'btn-panel-'+uuid);
    $('#btn-panel-'+uuid).attr("href", '#pdf-panel-'+uuid);
    
    app.db = window.sqlitePlugin.openDatabase({
      name : DATABASE_NAME,
      location : 'default'
    });
    analyticsApp.onAnalyticsEvent('PDF Viewer', 'Page View', url, '', '');
    // TODO: If dictionaries object is empty
    //var pannelAnnotationHTML = '<div id="panel-annot-html">';
    
    app.db.transaction(function(transaction) {
      transaction.executeSql(
          "SELECT cache_annotations.*, cache_yaml_files.path, cache_yaml_files.offline_file FROM cache_annotations LEFT JOIN cache_yaml_files ON cache_annotations.annot_uuid = cache_yaml_files.uuid  WHERE cache_annotations.source='"+uuid+"'", [], function(tx,
              results) {
            var len = results.rows.length, i;
           // console.log("asa bannu annotations: len " + len);
            //var pannelAnnotationHTML = '<div id="panel-annot-html">';
            var pannelAnnotationHTML = '';
            // Resetting annotationsObject for new PDF file viewer
            annotationsObject = {};
            for (i = 0; i < len; i++) {
             // console.log("asa in for " + i);
              var annot_quote = results.rows.item(i).annot_quote;
              if(annot_quote.length >= 3){
                var annot_comment = results.rows.item(i).annot_comment;
                var annot_id = results.rows.item(i).annot_uuid;
               // console.log("asa blackie annotations: annot_id " + annot_id);
               // console.log("asa blackie: results.rows.item(i)"+ JSON.stringify(results.rows.item(i)));
  
                annotationsObject[annot_quote] = {
                    "id" : annot_id,
                    "source_uuid" : uuid,
                    "text" : results.rows.item(i).annot_text
                   // "comment" : annot_comment
                  };
               // console.log("asa annotationsObject"+ JSON.stringify(annotationsObject));
  
                //results.rows.item(i).path = _articles/English/Wikipedia/Uncategorized/Outline of life forms
                var opener_file_more_string = Application.pannelAnnotationMoreHTMLcalculate(results.rows.item(i).path, results.rows.item(i).id, results.rows.item(i).offline_file);
                //var opener_file_url = 'storage/sdcard1/Downloads/eschool-android-sdcard/eschool2go/_articles/English/Textbooks/India/Telangana/SSC/Biology/1. Nutrition - Food supplying system.pdf';
                //pannelAnnotationHTML += '<div class="annot bordered-box" id="annot-'+annot_id+'"><strong>'+annot_quote+':</strong> '+annot_comment+opener_file_more_string+'</div>';
                pannelAnnotationHTML += '<li data-filtertext="'+annot_quote+'" class="annot bordered-box" id="annot-'+annot_id+'"><strong>'+annot_quote+':</strong> '+annot_comment+opener_file_more_string+'</li>';
               // console.log("asa bannu annotations: pannelAnnotationHTML " + pannelAnnotationHTML);
                //pannelAnnotationHTML += '<div class="annot" id="annot-'+annot_id+'"><strong>'+annot_quote+':</strong> '+annot_comment+' <a href="pdfviewer.html">More...</a></div>';
              }
            }
         // console.log("jenny before len > 0 condition" + len);
            if(len > 0){
              //console.log("asa in len > 0 condition" + len);
              //pannelAnnotationHTML += '</div>';
             // console.log("jenny bannu annotations: pannelAnnotationHTML " + pannelAnnotationHTML);
              $('#pdf-panel-'+uuid+' .ui-panel-inner ul.annotations-list').append(pannelAnnotationHTML);
              $('#pdf-panel-'+uuid+' .ui-panel-inner ul.annotations-list').listview('refresh');
             // console.log("nick: appending to panel "+'#pdf-panel-'+uuid+' .ui-panel-inner'+pannelAnnotationHTML);
              //$('#panel-annot-html').height('3000px');
              //$('#mypanel').height('3200px');
              $('#pdf-panel-'+uuid).trigger( "updatelayout" );
              //$('#mypanel').append($('#panel-annot-html').height());
              //$("#btn-panel-options")[0].click();
            }
           // console.log("jenny after len > 0 condition" + len);
          }, null);
    });
    
    if(true){
      app.db.transaction(function(transaction) {
        transaction.executeSql(
            "SELECT cache_dictionaries.*, cache_yaml_files.path, cache_yaml_files.offline_file FROM cache_dictionaries LEFT JOIN cache_yaml_files ON cache_dictionaries.uuid = cache_yaml_files.uuid", [], function(tx,
                results) {
              var len = results.rows.length, i;
             // console.log("asa bannu cache_dictionaries: len " + len);
              // TODO: Don't reset everytime as the object is constant
              //dictionariesObject = {};
              //var pannelAnnotationHTML = '<div id="panel-dict-html">';
              var pannelAnnotationHTML = '';
              for (i = 0; i < len; i++) {
               // console.log("asa in for " + i);
                var dictionary_word = results.rows.item(i).word;
                if(dictionary_word.length >= 3){
                  var dictionary_uuid = results.rows.item(i).uuid;
                  var dictionary_definition = results.rows.item(i).definition;
                  /*dictionariesObject[dictionary_word] = {
                      "id" : dictionary_uuid,
                      "source_uuid" : uuid
                    //  "definition" : dictionary_definition
                    };*/
                 // console.log("jenny before : opener_file_more_string " + results.rows.item(i).path);
                  var opener_file_more_string = Application.pannelAnnotationMoreHTMLcalculate(results.rows.item(i).path, results.rows.item(i).id, results.rows.item(i).offline_file);
                 // console.log("jenny after : opener_file_more_string " + opener_file_more_string);
                  //var opener_file_url = 'storage/sdcard1/Downloads/eschool-android-sdcard/eschool2go/_articles/English/Textbooks/India/Telangana/SSC/Biology/1. Nutrition - Food supplying system.pdf';
                  //pannelAnnotationHTML += '<div class="annot bordered-box" id="annot-'+dictionary_uuid+'"><strong>'+dictionary_word+':</strong> ' + dictionary_definition + opener_file_more_string+'</div>';
                  pannelAnnotationHTML += '<li data-filtertext="'+dictionary_word+'" class="annot bordered-box" id="annot-'+dictionary_uuid+'"><strong>'+dictionary_word+':</strong> ' + dictionary_definition + opener_file_more_string+'</li>';
                }
              }
              
             // console.log("jenny before len > 0 condition" + len);
              if(len > 0){
                //console.log("asa in len > 0 condition" + len);
                //pannelAnnotationHTML += '</div>';
               // console.log("jenny bannu annotations: pannelAnnotationHTML " + pannelAnnotationHTML);
                $('#pdf-panel-'+uuid+' .ui-panel-inner ul.annotations-list').append(pannelAnnotationHTML);
                $('#pdf-panel-'+uuid+' .ui-panel-inner ul.annotations-list').listview('refresh');
               // console.log("nick: appending to panel "+'#pdf-panel-'+uuid+' .ui-panel-inner'+pannelAnnotationHTML);
                //$('#panel-annot-html').height('3000px');
                //$('#mypanel').height('3200px');
                $('#pdf-panel-'+uuid).trigger( "updatelayout" );
                //$('#mypanel').append($('#panel-annot-html').height());
                //$("#btn-panel-options")[0].click();
              }
             // console.log("jenny after len > 0 condition" + len);
              
          }, null);
        });
    }
    // file:///storage/sdcard1/Downloads/eschool-android-sdcard/eschool2go/_articles/English/Textbooks/India/Telangana/SSC/Biology/1. Nutrition - Food supplying system.pdf
    //_articles/English/Textbooks/India/Telangana/SSC/Biology/1. Nutrition - Food supplying system.pdf
    //annotationsObject = url;
    // <iframe id="web-view-frame"
    // src='js/pdfjs-web/web/viewer.html?file=file://mnt/sdcard/Download/PGRDeclarationsPage.pdf'
    // height='627px' width='100%' scrolling='auto' frameBorder='0' ></iframe>
    // TODO: Remove examples/mobile-viewer/viewer.html will not work as it's canvas based & no HTML for annotations text in DOM
    //$('#pdf-view-frame').attr("src",
    //    "js/pdfjs/examples/mobile-viewer/viewer.html?file=" + url);
    $('#pdf-view-frame').attr("id", 'pdf-frame-'+uuid);
    $('#pdf-frame-'+uuid).attr("src", "js/pdfjs/web/viewer.html?file="+url);
    //$('#pdf-view-frame').attr("src", "http://wikipediainschools.org/");
    /*$("#showAllAnnotations").click(
        function() {
          console.log("adarsh: in showAllAnnotations");
          Application.applyPDFviewerAnnotations('#pdf-frame-'+uuid);
        });*/
  },

  initApplication : function() {
    // http://stackoverflow.com/questions/38720493/how-to-check-internet-connection-on-a-cordova-app
    document.addEventListener("online", analyticsApp.onOnline, false);
    document.addEventListener("offline", analyticsApp.onOffline, false);
    document.addEventListener("backbutton", analyticsApp.onBackKeyDown, false);

    var settingsFromLocalStorage = window.localStorage.getItem("'"
        + SETTING_LOCAL_STORAGE_NAME + "'");
    if (settingsFromLocalStorage && (settingsFromLocalStorage != null)) {
      settings = JSON.parse(settingsFromLocalStorage);
      if ((settings != null) && settings.sdcardLoc) {
        sdcardLoc = settings.sdcardLoc;
      }
    }

    if (window.localStorage.getItem(INSTALLATION_CHECK_VALUE) == undefined) {
      Application.callFirstTimeApplicationLaunch();
      window.localStorage.setItem(INSTALLATION_CHECK_VALUE, true);
    }

    $(document).on('pageinit', '#' + SETTING_PAGE_ID, function() {
      Application.initSettingsPage();
    }).on('pageinit', '#' + WEB_VIEWER_PAGE_ID, function() {
      var url = this.getAttribute('data-url').replace(/(.*?)link=/g, '');
      Application.initWebViewerPage(url);
    }).on('pageinit', '#' + PDF_VIEWER_PAGE_ID, function() {
      // /android_asset/www/pdfviewer.html?uuid=9401a2c8-6470-42f4-ac20-7582c0dc0581&link=file:///storage/sdcard1/Downloads/eschool-android-sdcard/eschool2go/_articles/English/Textbooks/India/Telangana/SSC/Biology/
      var dataUrl = this.getAttribute('data-url');
      //console.log("bannu: dataUrl" + dataUrl);
      //console.log("bannu: dataUrl index" + dataUrl.indexOf("?"));
      //console.log("bannu: dataUrl.substring(dataUrl.indexof("?"))" + dataUrl.substring(dataUrl.indexOf("?")));
      var params = Application.parseQueryString(dataUrl.substring(dataUrl.indexOf("?")+1));
      //console.log("bannu: params"+ JSON.stringify(params));
      var uuid = params.uuid;
      var url = params.link;
     // console.log("bannu: uuid" + params.uuid);
      Application.initPDFViewerPage(uuid, url);
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
        });
    Application.openLinksInApp();
    if (window.localStorage.getItem(INSTALLATION_CHECK_VALUE) != undefined) {
      Application.initListIndexPage();
    }

    $("#" + HOME_PAGE_REFRESH_BTN_ID).click(function() {
      Application.setInstallationValue();
    });
  },
  
  parseQueryString : function(query) {
    var parts = query.split('&');
    var params = {};
    for (var i = 0, ii = parts.length; i < ii; ++i) {
      var param = parts[i].split('=');
      var key = param[0].toLowerCase();
      var value = param.length > 1 ? param[1] : null;
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return params;
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
   // console.log("adarsh: callFirstTimeApplicationLaunch: " );
    app.db = window.sqlitePlugin.openDatabase({
      name : DATABASE_NAME,
      location : 'default'
    });
   // console.log("adarsh: before prepareCacheTables: " );
    app.prepareCacheTables();
   // console.log("adarsh: after prepareCacheTables: " );
    /*
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
    });*/
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
    $("#uploadAnalyticsToServer").click(
        function() {
          // console.log("droidbase: in uploadAnalyticsToServer");
          analyticsApp.uploadBatchToServer();
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

  /*isDBExists : function() {
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
  },*/
  initListExplorerPage : function(categParent, listview_id) {
    app.db = window.sqlitePlugin.openDatabase({
      name : DATABASE_NAME,
      location : 'default'
    });
    analyticsApp.onAnalyticsEvent('Explorer', 'Page View', categParent, '', '');
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
                        var len = results.rows.length, i;
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
                              "uuid" : results.rows.item(i).uuid,
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
                        // If length of listItemsObj is 1 and not file
                        if (Object.keys(listItemsObj).length == 1
                            && !Object.keys(listItemsObj)[0].endsWith(".yaml")) {
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
                            // Remove file name
                            var folderPathArray = folderPath.split("/");
                            folderPathArray.pop()
                            folderMultiPathArray.push(folderPathArray);
                            if (folderPathArray.length < minimum_length) {
                              minimum_length = folderPathArray.length;
                            }
                          }
                          var matchingComponentArray = [];
                          for (i = 0; i < minimum_length; i++) {
                            var matching_component = folderMultiPathArray[0][i];
                            var is_matched = true;
                            for (var j = 1; j < folderMultiPathArray.length; j++) {
                              if (folderMultiPathArray[j][i] != matching_component) {
                                is_matched = false;
                              }
                            }
                            if (is_matched == true) {
                              matchingComponentArray.push(matching_component);
                            }
                          }
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
                                          + '<span onclick="Application.onClickOfFileOpener(\''
                                          + opener_file_url + '\')">'
                                          + file_display_name + '</span></li>';
                                    } else if (el.type
                                        && (el.type == "article" || el.type == "definition")) {
                                      if (el.type == "article") {
                                        var rootDir = '_articles/';
                                      }else if (el.type == "definition") {
                                        var rootDir = '_definitions/';
                                      }
                                      // check for video file webm or mp4 or mkv
                                      // _videos folder
                                      // replace space with %20
                                      // http://android.stackexchange.com/questions/4775/how-can-i-open-an-html-file-i-have-copied-from-pc-to-sd-card-of-phone
                                      // %20 or whole string in quotes
                                      // "/mnt/sdcard/Documents/To Read.html"
                                      var opener_file_url = sdcardLoc
                                          + rootDir + categParent
                                          + el.offline_file.trim();
                                      //opener_file_url = opener_file_url.replace(/\s+/g, '%20');
                                      var htmlItems = '<li><a href="pdfviewer.html?uuid='
                                          + el.uuid
                                          + '&link=file:///'
                                          + opener_file_url
                                          + '">'
                                          + file_display_name + '</a></li>';
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
  onClickOfFileOpener : function(opener_file_url) {
    //console.log( "jennik: onClickOfFileOpener:" + opener_file_url );
    // category, action, location, label, value
    analyticsApp.onAnalyticsEvent('Explorer', 'file click', opener_file_url, '', '');
    window.plugins.fileOpener.open('file:///' + opener_file_url);
  },
  initListIndexPage : function(categParent) {
    if (!categParent || (categParent.indexOf(HOME_PAGE_NAME) !== -1)) {
      categParent = VIDEO_FOLDER_NAME;
    }
    categParent = '';
    Application.initListExplorerPage(categParent, 'index-contents-list');
  },
};
