var analyticsApp = {};

analyticsApp.onOnline = function() {
 // console.log("adarsh: onOnline: " );
  // send analytic event directly to remote server
  // http://stackoverflow.com/questions/31182536/how-can-i-get-wifi-network-information-ssid-in-a-phonegap-app
  WifiWizard.getCurrentSSID(analyticsApp.onOnlineSSIDsuccess, analyticsApp.onOnlineSSIDfail);
};

analyticsApp.onBackKeyDown = function() {
 // console.log("adarsh: onBackKeyDown: " );
  analyticsApp.onAnalyticsEvent('Device', 'button press', 'N/A', "back", '');
  history.go(-1);
  //navigator.app.backHistory();
};

analyticsApp.onOnlineSSIDsuccess = function(ssid) {
  analyticsApp.onAnalyticsEvent('Device', 'Online', 'N/A', "SSID", ssid);
};

analyticsApp.onOnlineSSIDfail = function(error) {
  var networkState = navigator.connection.type;
  analyticsApp.onAnalyticsEvent('Device', 'Online', 'N/A', "State", networkState);
};

analyticsApp.onAnalyticsEvent = function(category, action, location, label, value) {
  // If online, post directly without database entry
 // console.log("adarsh: onAnalyticsEvent: " );
  // created
  var d = new Date();
  var created = d.getTime();
  // generate UUID
  var uuid = device.uuid + "-" + created;
  
  var networkState = navigator.connection.type;
 // console.log("adarsh: networkState: " + networkState );
  if (networkState !== Connection.NONE) {
    analyticsApp.uploaadAnalyticsEvent(uuid, created, category, action, location, label, value);
  }else{
    app.insertAnalyticsEvent(uuid, created, category, action, location, label, value);
  }
}

analyticsApp.uploaadAnalyticsEvent = function(uuid, created, category, action, location, label, value) {
  var postData ={};
  var postEventsData = [];
  var eventObj = {
      "id" : uuid,
      "category" : category,
      "action" : action,
      "location" : location,
      "label" : label,
      "value" : value,
      "created" : created,
    };
  postEventsData.push(eventObj);
  postData["events"] = postEventsData;
  postData["client"] = {
      "id" : device.uuid,
      "version" : APPLICATION_VERSION
    };

  $.ajax({
    url:"http://eschool2go.org/api/v1/events",
    type:"POST",
    data:JSON.stringify(postData),
    contentType:"application/json; charset=utf-8",
    success: function(data){
     // console.log("adarsh: uploaadAnalyticsEvent sent. Data Loaded: " + JSON.stringify(data) );
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
     // console.log("adarsh: uploaadAnalyticsEvent post error:" + errorThrown );
      app.insertAnalyticsEvent(uuid, created, category, action, location, label, value);
    }
  });
};

analyticsApp.onOffline = function() {
 // console.log("adarsh: onOffline: " );
  var networkState = navigator.connection.type;
  analyticsApp.onAnalyticsEvent('Device', 'Offline', 'N/A', 'State', networkState);
};

analyticsApp.uploadBatchToServer = function() {
  app.db.transaction(function(transaction) {
    transaction.executeSql(
        "SELECT analytics_events.* FROM analytics_events WHERE sent = 0 LIMIT 2", [], function(tx,
            results) {
          var len = results.rows.length, i;
         // console.log("adarsh: uploadToServer: len" + len );
          var postData ={};
          var postEventsData = [];
          for (i = 0; i < len; i++) {
            var eventObj = {
                "id" : results.rows.item(i).uuid,
                "category" : results.rows.item(i).category,
                "action" : results.rows.item(i).action,
                "location" : results.rows.item(i).location,
                "label" : results.rows.item(i).label,
                "value" : results.rows.item(i).value,
                "created" : results.rows.item(i).created,
              };
            postEventsData.push(eventObj);
          }
          postData["events"] = postEventsData;

          if(len > 0){
            postData["client"] = {
                "id" : device.uuid,
                "version" : APPLICATION_VERSION
              };
            console.log("adarsh: APPLICATION_VERSION: " + JSON.stringify(postData["client"]) );
            $.ajax({
              url:"http://eschool2go.org/api/v1/events",
              type:"POST",
              data:JSON.stringify(postData),
              contentType:"application/json; charset=utf-8",
              success: function(data){
               // console.log("adarsh: Data Loaded: " + JSON.stringify(data) );
                var received_uuid = data.recieved;
                var inClause = received_uuid.toString();
                if(inClause){
                  // at this point inClause will look like 23,343,33,55,43
                  inClause = inClause.replace(/,/g, '","');
                  inClause = '("' + inClause + '")';

                  // Update database, sent = 1
                  app.db
                  .transaction(function(tx) {
                    tx
                        .executeSql(
                            'UPDATE analytics_events SET sent = 1 WHERE uuid IN ' + inClause,
                            [], app.onSuccess, app.onError);
                  });
                 // console.log("adarsh: sent flag updated: ");
                }
              },
              error: function(XMLHttpRequest, textStatus, errorThrown) {
               // console.log("adarsh: post error:" + errorThrown );
              }
            });
          }
        }, null);
  });
}