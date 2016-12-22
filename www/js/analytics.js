var analyticsApp = {};

analyticsApp.onOnline = function() {
  console.log( "adarsh: onOnline: " );
  // send analytic event directly to remote server
  // http://stackoverflow.com/questions/31182536/how-can-i-get-wifi-network-information-ssid-in-a-phonegap-app
  WifiWizard.getCurrentSSID(analyticsApp.onOnlineSSIDsuccess, analyticsApp.onOnlineSSIDfail);
};

analyticsApp.onOnlineSSIDsuccess = function(ssid) {
  analyticsApp.onOnlineEventUpload("SSID", ssid);
};

analyticsApp.onOnlineSSIDfail = function(error) {
  var networkState = navigator.connection.type;
  analyticsApp.onOnlineEventUpload("State", networkState);
};

analyticsApp.onOnlineEventUpload = function(label, value) {
  var postData ={};
  postData["events"][0] = {
    "id" : device.uuid,
    "category" : 'Device',
    "action" : 'Online',
    "location" : 'N/A',
    "label" : label,
    "value" : value
  };
  $.post( "http://build.opencurricula.technikh.com/api/v1/events", postData)
  .done(function( data ) {
    console.log( "adarsh: Data Loaded: " + data );
  });
};

analyticsApp.onOffline = function() {
  console.log( "adarsh: onOffline: " );
  var networkState = navigator.connection.type;
  app.insertAnalyticsEvent('Device', 'Offline', 'N/A', 'State', networkState);
};

analyticsApp.uploadToServer = function() {
  console.log( "adarsh: uploadToServer: " );
  app.db.transaction(function(transaction) {
    transaction.executeSql(
        "SELECT analytics_events.* FROM analytics_events WHERE sent = 0 LIMIT 2", [], function(tx,
            results) {
          var len = results.rows.length, i;
          console.log( "adarsh: uploadToServer: len" + len );
          var postData ={};
          var postEventsData = [];
          var updateUuidArray = [];
          for (i = 0; i < len; i++) {
            console.log( "adarsh: in for: " + i );
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
            //console.log("adarsh postData: "+ JSON.stringify(postEventsData));
            updateUuidArray.push(results.rows.item(i).uuid);
          }
          postData["events"] = postEventsData;

          if(len > 0){
            console.log( "adarsh: before device.uuid: " + device.uuid );
            postData["client"] = {
                "id" : device.uuid
              };
            console.log( "adarsh: after device.uuid: ");

            var inClause = updateUuidArray.toString();
            console.log( "adarsh: uploadToServer: inClause" + inClause );

            // at this point inClause will look like "[23,343,33,55,43]"
            // replace the brackets with parentheses
            inClause = inClause.replace("[","(");
            inClause = inClause.replace("]",")");
  
            // now inClause will look like "(23,343,33,55,43)" so use it to
            // construct your
            console.log( "adarsh: before posting: " + JSON.stringify(postData));
            $.ajax({
              url:"http://build.opencurricula.technikh.com/api/v1/events",
              type:"POST",
              data:JSON.stringify(postData),
              contentType:"application/json; charset=utf-8",
              success: function(data){
                console.log( "adarsh: Data Loaded: " + JSON.stringify(data) );
                console.log( "adarsh: SQL: " + "UPDATE analytics_events SET sent = 1 WHERE uuid IN " + inClause );
                // Update database, sent = 1
                app.db
                .transaction(function(tx) {
                  tx
                      .executeSql(
                          "UPDATE analytics_events SET sent = 1 WHERE uuid IN " + inClause,
                          [], app.onSuccess, app.onError);
                });
                console.log( "adarsh: sent flag updated: ");
              },
              error: function(XMLHttpRequest, textStatus, errorThrown) {
                console.log( "adarsh: post error:" + errorThrown );
              }
            });
          }
        }, null);
  });
}