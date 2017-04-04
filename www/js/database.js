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
app.insertYAMLrecord = function(name, path, extension, type, offline_file,
    displayName, description) {
  var path_array = path.split("/");
  path_array.shift();
  var unified_path = path_array.join('/');
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                "INSERT INTO cache_yaml_files(name, path, unified_path, extension, type, offline_file, display_name, description) VALUES (?,?,?,?,?,?,?,?)",
                [ name, path, unified_path, extension, type, offline_file,
                    displayName, description ], app.onSuccess, app.onError);
      });
}

app.prepareCacheTables = function() {
  // Drop table
  app.db.transaction(function(tx) {
    tx.executeSql("DROP TABLE IF EXISTS cache_video_files", app.onSuccess,
        app.onError);
  });
  // Create table
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                'CREATE TABLE IF NOT EXISTS cache_video_files (id integer primary key, name text, path text, extension text)',
                app.onSuccess, app.onError);
      });

  // Drop table
  app.db.transaction(function(tx) {
    tx.executeSql("DROP TABLE IF EXISTS cache_image_files", app.onSuccess,
        app.onError);
  });
  // Create table
  app.db
      .transaction(function(tx) {
        tx
            .executeSql(
                'CREATE TABLE IF NOT EXISTS cache_image_files (id integer primary key, name text, path text, extension text)',
                app.onSuccess, app.onError);
      });

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
                'CREATE TABLE IF NOT EXISTS cache_yaml_files (id integer primary key, name text, path text, unified_path text, extension text, type text, offline_file text, display_name text, description text)',
                app.onSuccess, app.onError);
      });
	 
}

app.onSuccess = function(tx, r) {
  // console.log("Your SQLite query was successful!");
  $.mobile.loading('hide');	
}

app.onSuccessWithCallback = function(tx, r,callback) {
  // console.log("Your SQLite query was successful!");
  callback();
  $.mobile.loading('hide');	
}

app.onSuccessWithCallbackReturnResult = function(tx, r,callback) {
  callback(r);
  $.mobile.loading('hide');	
}

app.onSuccessWithCallbackReturnResultAndId = function(tx, r,callback,id) {
  callback(r,id);
  $.mobile.loading('hide');	
}

app.onError = function(tx, e) {

  console.log("SQLite Error: " + JSON.stringify(e));
  // SQLite Error: {"rows":{"length":0},"rowsAffected":0}
  if (e.message) {
    navigator.notification.alert("SQLite Error: " + e.message);
  }
}

app.insertDiscussionPoints = function(title,question,callback){
	//Create Discussion table if already not exists
	$.mobile.loading('show');
	app.db
      .transaction(function(tx) {
			tx.executeSql("CREATE TABLE IF NOT EXISTS discussion_points (Id integer primary key AUTOINCREMENT, Discussion_Title_Point text,Discussion_Point text)"
				,app.privateInsertDiscussionPoints(title,question,callback), app.onError);
      });
}

app.privateInsertDiscussionPoints = function(title,question,callback){
	app.db.transaction(function(tx) {
		tx.executeSql(
			"INSERT INTO discussion_points (Discussion_Title_Point,Discussion_Point) VALUES (?,?)",
			[title,question], function(transaction, result){app.onSuccessWithCallback(transaction,result,callback);}, app.onError);
	  });
}


app.updateDiscussionAnswer = function(id,answer){
	app.db.transaction(function(tx) {
		
		//tx.executeSql("UPDATE discussion_points_answer SET Answer = '"+answer+"' WHERE Discussion_Point_Id = "+id+" AND User_Id = "+GLOBAL_USER_ID+"");
		//tx.executeSql(
				//"INSERT INTO discussion_points_answer (Discussion_Point_Id,User_Id,Answer) SELECT "+id+","+GLOBAL_USER_ID+",'"+answer+"' WHERE NOT EXISTS (SELECT 1 FROM discussion_points_answer WHERE Discussion_Point_Id = "+id+" AND User_Id = "+GLOBAL_USER_ID+" ); ",
			//[], app.onSuccess, app.onError);
			
			tx.executeSql(
				"INSERT INTO discussion_points_answer (Discussion_Point_Id,User_Id,Answer) SELECT "+id+","+GLOBAL_USER_ID+",'"+answer+"';",
			[], app.onSuccess, app.onError);
			
		//tx.executeSql(
			//"UPDATE discussion_points SET  Answer = ? WHERE Id = ?",
			//[answer,id], app.onSuccess, app.onError);
	  });
}

app.updateDiscussionLikeDislike = function(id,likedislike){
	app.db.transaction(function(tx) {
		//tx.executeSql("UPDATE discussion_points_likedislike SET LikeDisLike = '"+likedislike+"' WHERE Discussion_Point_Id = "+id+" AND User_Id = "+GLOBAL_USER_ID+"");
		
		//tx.executeSql(
		//		"INSERT INTO discussion_points_likedislike (Discussion_Point_Id,User_Id,LikeDisLike) SELECT "+id+","+GLOBAL_USER_ID+",'"+likedislike+"' WHERE NOT EXISTS (SELECT 1 FROM discussion_points_likedislike WHERE Discussion_Point_Id = "+id+" AND User_Id = "+GLOBAL_USER_ID+" ); ",
		//	[], app.onSuccess, app.onError);
			
		tx.executeSql(
			"INSERT INTO discussion_points_likedislike (Discussion_Point_Id,User_Id,LikeDisLike) VALUES ('"+id+"','"+GLOBAL_USER_ID+"','"+likedislike+"')",
		[], app.onSuccess, app.onError);

		});
}

app.updateDiscussionUsefulNonUseful = function(id,usefulnonuseful){
	app.db.transaction(function(tx) {
		//tx.executeSql("UPDATE discussion_points_usefulnonuseful SET UserfulNonUseful = '"+usefulnonuseful+"' WHERE Discussion_Point_Id = "+id+" AND User_Id = "+GLOBAL_USER_ID+"");
		//tx.executeSql(
		//		"INSERT INTO discussion_points_usefulnonuseful (Discussion_Point_Id,User_Id,UserfulNonUseful) SELECT "+id+","+GLOBAL_USER_ID+",'"+usefulnonuseful+"' WHERE NOT EXISTS (SELECT 1 FROM discussion_points_usefulnonuseful WHERE Discussion_Point_Id = "+id+" AND User_Id = "+GLOBAL_USER_ID+" ); ",
		//	[], app.onSuccess, app.onError);
			
		tx.executeSql(
			"INSERT INTO discussion_points_usefulnonuseful (Discussion_Point_Id,User_Id,UserfulNonUseful) VALUES ('"+id+"','"+GLOBAL_USER_ID+"','"+usefulnonuseful+"')",
		[], app.onSuccess, app.onError);
	  });
}

app.prepareDiscusssionTables = function(callback)
{
	//Create Discussion Related tables
	app.db.transaction(function(tx) {
		  tx.executeSql("CREATE TABLE IF NOT EXISTS Users (Id integer primary key AUTOINCREMENT,UserName text);",app.createDefaultUsers(),app.onError);
		  tx.executeSql("CREATE TABLE IF NOT EXISTS discussion_points_likedislike (Id integer primary key AUTOINCREMENT,Discussion_Point_Id integer,User_Id integer,LikeDisLike text);");
		  tx.executeSql("CREATE TABLE IF NOT EXISTS discussion_points_answer (Id integer primary key AUTOINCREMENT,Discussion_Point_Id integer,User_Id integer,Answer text);");
		  tx.executeSql("CREATE TABLE IF NOT EXISTS discussion_points_usefulnonuseful (Id integer primary key AUTOINCREMENT,Discussion_Point_Id integer,User_Id integer,UserfulNonUseful text);");
		  tx.executeSql("CREATE TABLE IF NOT EXISTS discussion_points_view (Id integer primary key AUTOINCREMENT,Discussion_Point_Id integer,User_Id integer,ViewDate text);");
		  
		  tx.executeSql("CREATE TABLE IF NOT EXISTS discussion_points_answer_likedislike (Id integer primary key AUTOINCREMENT,Discussion_Point_Answer_Id integer,User_Id integer,LikeDisLike text);");
		  tx.executeSql("CREATE TABLE IF NOT EXISTS discussion_points_answer_usefulnonuseful (Id integer primary key AUTOINCREMENT,Discussion_Point_Answer_Id integer,User_Id integer,UserfulNonUseful text);");
		  
		  tx.executeSql("CREATE TABLE IF NOT EXISTS discussion_points (Id integer primary key AUTOINCREMENT, Discussion_Title_Point text,Discussion_Point text);",callback(),app.onError);
		 });
}

app.createDefaultUsers = function(){
	app.db.transaction(function(tx) {
				  tx.executeSql("INSERT INTO Users (UserName) SELECT 'Admin' WHERE NOT EXISTS (SELECT 1 FROM Users WHERE UserName = 'Admin');");
				  tx.executeSql("INSERT INTO Users (UserName) SELECT 'Admin2' WHERE NOT EXISTS (SELECT 1 FROM Users WHERE UserName = 'Admin2');");
				  tx.executeSql("INSERT INTO Users (UserName) SELECT 'Admin3' WHERE NOT EXISTS (SELECT 1 FROM Users WHERE UserName = 'Admin3');");
		 });
}

app.updateAnswerLikeDislike = function(answerId,likedislike){
	app.db.transaction(function(tx) {
		tx.executeSql(
			"INSERT INTO discussion_points_answer_likedislike (Discussion_Point_Answer_Id,User_Id,LikeDisLike) VALUES ('"+answerId+"','"+GLOBAL_USER_ID+"','"+likedislike+"')",
		[], app.onSuccess, app.onError);
		});
}

app.updateAnswerUsefulNonUseful = function(answerId,usefulnonuseful){
	app.db.transaction(function(tx) {
		tx.executeSql(
			"INSERT INTO discussion_points_answer_usefulnonuseful (Discussion_Point_Answer_Id,User_Id,UserfulNonUseful) VALUES ('"+answerId+"','"+GLOBAL_USER_ID+"','"+usefulnonuseful+"')",
		[], app.onSuccess, app.onError);
	  });
}

app.countDiscussionUsefulNonUseful = function(discussionId,usefulNonUseful,callback){
	$.mobile.loading('show');
	var query = "SELECT COUNT(UserfulNonUseful) as 'Count' From discussion_points_usefulnonuseful WHERE UserfulNonUseful = '"+usefulNonUseful+"' AND Discussion_Point_Id = '"+discussionId+"'";
	console.log(query);
	app.db.transaction(function(tx) {
		tx.executeSql(
			 query, [], function(transaction, result){app.onSuccessWithCallbackReturnResult(transaction,result,callback);}, app.onError);
	  });
}

app.countDiscussionLikeDisLike = function(discussionId,likeDislikeValue,callback){
	$.mobile.loading('show');
	var query = "SELECT COUNT(LikeDisLike) as 'Count' From discussion_points_likedislike WHERE LikeDisLike = '"+likeDislikeValue+"' AND Discussion_Point_Id = '"+discussionId+"'";
	console.log(query);
	app.db.transaction(function(tx) {
		tx.executeSql(
			 query, [], function(transaction, result){app.onSuccessWithCallbackReturnResult(transaction,result,callback);}, app.onError);
	  });
}

app.countAnswerUsefulNonUseful = function(answerId,usefulNonUseful,callback){
	$.mobile.loading('show');
	var query = "SELECT COUNT(UserfulNonUseful) as 'Count' From discussion_points_answer_usefulnonuseful WHERE UserfulNonUseful = '"+usefulNonUseful+"' AND Discussion_Point_Answer_Id = '"+answerId+"'";
	console.log(query);
	app.db.transaction(function(tx) {
		tx.executeSql(
			 query, [], function(transaction, result){app.onSuccessWithCallbackReturnResultAndId(transaction,result,callback,answerId);}, app.onError);
	  });
}

app.countAnswerLikeDisLike = function(answerId,likeDislikeValue,callback){
	$.mobile.loading('show');
	var query = "SELECT COUNT(LikeDisLike) as 'Count' From discussion_points_answer_likedislike WHERE LikeDisLike = '"+likeDislikeValue+"' AND Discussion_Point_Answer_Id = '"+answerId+"'";
	console.log(query);
	app.db.transaction(function(tx) {
		tx.executeSql(
			 query, [], function(transaction, result){app.onSuccessWithCallbackReturnResultAndId(transaction,result,callback,answerId);}, app.onError);
	  });
}



