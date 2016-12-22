var app = {};
app.db = null;
// app.insertVideoRecord(entries[i].name, filePathWithoutExt, fileExt);
app.insertVideoRecord = function(name, path, extension) {
  app.db.transaction(function(tx) {
    tx.executeSql(
        "INSERT INTO cache_video_files(name, path, extension) VALUES (?,?,?)",
        [ name, path, extension ], app.onSuccess, app.onError);
  });
}
app.insertImageRecord = function(name, path, extension) {
  app.db.transaction(function(tx) {
    tx.executeSql(
        "INSERT INTO cache_image_files(name, path, extension) VALUES (?,?,?)",
        [ name, path, extension ], app.onSuccess, app.onError);
  });
}
// app.insertYAMLrecord(fileEntry.name, filePathWithoutExt, fileExt, doc.title);
app.insertYAMLrecord = function(uuid, name, path, extension, type, offline_file,
    displayName, description) {
  var path_array = path.split("/");
  path_array.shift();
  var unified_path = path_array.join('/');
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                "INSERT INTO cache_yaml_files(uuid, name, path, unified_path, extension, type, offline_file, display_name, description) VALUES (?,?,?,?,?,?,?,?,?)",
                [ uuid, name, path, unified_path, extension, type, offline_file,
                    displayName, description ], app.onSuccess, app.onError);
      });
}

app.insertAnnotationsData = function(source, annot_uuid, annot_quote, annot_text, annot_comment) {
  // Source: _articles/English/Textbooks/India/Telangana/SSC/Biology/1. Nutrition - Food supplying system.pdf
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                "INSERT INTO cache_annotations(source, annot_uuid, annot_quote, annot_text, annot_comment) VALUES (?,?,?,?,?)",
                [ source, annot_uuid, annot_quote, annot_text, annot_comment ], app.onSuccess, app.onError);
      });
}

app.insertAnalyticsEvent = function(category, action, location, label, value) {
  console.log( "adarsh: insertAnalyticsEvent: " );
  // created
  var d = new Date();
  var created = d.getTime();
  // generate UUID
  var uuid = device.uuid + "-" + created;
  
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                "INSERT INTO analytics_events(uuid, category, action, location, label, value, created, sent) VALUES (?,?,?,?,?,?,?,?)",
                [ uuid, category, action, location, label, value, created, 0], app.onSuccess, app.onError);
      });
}

app.prepareCacheTables = function() {
  // Drop table
  app.db.transaction(function(tx) {
    tx.executeSql("DROP TABLE IF EXISTS cache_yaml_files", app.onSuccess,
        app.onError);
  });
  // Create table
  /*
   * type: video/article
   */
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                'CREATE TABLE IF NOT EXISTS cache_yaml_files (id integer primary key, uuid text, name text, path text, unified_path text, extension text, type text, offline_file text, display_name text, description text)',
                app.onSuccess, app.onError);
      });

  //Drop table
  app.db.transaction(function(tx) {
    tx.executeSql("DROP TABLE IF EXISTS cache_annotations", app.onSuccess,
        app.onError);
  });
  // Create table
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                'CREATE TABLE IF NOT EXISTS cache_annotations (id integer primary key, source text, annot_uuid text, annot_quote text, annot_text text, annot_comment text)',
                app.onSuccess, app.onError);
      });
  
  app.prepareAnalyticsTables();
}

app.prepareAnalyticsTables = function() {
  // Create table
  // https://www.sqlite.org/datatype3.html
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                'CREATE TABLE IF NOT EXISTS analytics_events (id integer primary key, uuid text, category text, action text, location text, label text, value text, created INTEGER, sent INTEGER)',
                app.onSuccess, app.onError);
      });
}

app.onSuccess = function(tx, r) {
  // console.log("Your SQLite query was successful!");
}

app.onError = function(tx, e) {
  console.log("SQLite Error: " + JSON.stringify(e));
  // SQLite Error: {"rows":{"length":0},"rowsAffected":0}
  if (e.message) {
    navigator.notification.alert("SQLite Error: " + e.message);
  }
}
