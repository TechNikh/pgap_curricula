/*setTimeout(function() {
  console.log("rahul: setTimeout on load");
  pdfAnnotationsViewerApp.applyAnnotations();
  //pdfAnnotationsViewerApp.openAnnotationsPanel();

  //pdfAnnotationsViewerApp.scrollAnnotationsPanel("#num81");

}, 7000);*/

var pdfAnnotationsViewerApp = {
  applyAnnotations : function() {
    //console.log("rahul: applyAnnotations");
    $('div.textLayer div').not( ".annotationsProcessed" )
        .each(
            function() {
              $(this).addClass('annotationsProcessed');
              var contentfull = $(this).html();
              /*
               * Explode contentfull string into word array
               * check if any of the word exists in annotationsObject or dictionariesObject
               */
              // console.log("rahul: " + contentfull);
              $.each(parent.annotationsObject, function(i, el) {
                //console.log("bannu : annotationsObject " + i);
                var re = new RegExp(i,"g");
                contentfull = contentfull
                .replace(
                    re,
                    '<span onclick="pdfAnnotationsViewerApp.onClickOfAnnotationQuote(\''+el.id+'\', \''+el.source_uuid+'\', \''+el.text+'\')" style="background:yellow; margin-left: -2px;">'+i+' </span>');
                //console.log("bannu : span onclick " + '<span onclick="pdfAnnotationsViewerApp.onClickOfAnnotationQuote(\''+el.id+'\')" style="');
              });
              
              /*$.each(parent.dictionariesObject, function(i, el) {
                //console.log("bannu : annotationsObject " + i);
                var re = new RegExp(i,"g");
                contentfull = contentfull
                .replace(
                    re,
                    '<span onclick="pdfAnnotationsViewerApp.onClickOfAnnotationQuote(\''+el.id+'\', \''+el.source_uuid+'\')" style="background:red; margin-left: -2px;">'+i+' </span>');
                //console.log("bannu : span onclick " + '<span onclick="pdfAnnotationsViewerApp.onClickOfAnnotationQuote(\''+el.id+'\')" style="');
              });*/
              //console.log("bannu: " + contentfull);
              $(this).html(contentfull);
            });
  },
  openAnnotationsPanel : function(jquery_selector) {
    $(jquery_selector, window.parent.document)[0].click();
  },
  scrollAnnotationsPanel : function(jquery_selector) {
    $(jquery_selector, window.parent.document)[0].scrollIntoView();
  },
  clearAnnotationsPanelSearchFilter : function(jquery_selector) {
   // console.log("nikki: " + jquery_selector);
    //console.log("nikki: " + $(jquery_selector, window.parent.document));
    $(jquery_selector, window.parent.document)[0].click();
  },
  onClickOfAnnotationMoreLink : function(opener_file_url) {
    // category, action, location, label, value
    //analyticsApp.onAnalyticsEvent('PDF Viewer', 'link click', 'N/A', 'more', opener_file_url);
  },
  onClickOfAnnotationQuote : function(id, source_uuid, text) {
    // category, action, location, label, value
    //analyticsApp.onAnalyticsEvent('PDF Viewer', 'link click', 'N/A', 'annotation', text);
    pdfAnnotationsViewerApp.openAnnotationsPanel('#btn-panel-'+source_uuid);
    if($("#pdf-panel-"+source_uuid+" .ui-input-search input", window.parent.document).val()){
      pdfAnnotationsViewerApp.clearAnnotationsPanelSearchFilter("#pdf-panel-"+source_uuid+" .ui-input-search .ui-input-clear");
      setTimeout(function() {
       // console.log("nikki: setTimeout on load");
        pdfAnnotationsViewerApp.scrollAnnotationsPanel("#pdf-panel-"+source_uuid+" #annot-"+id);

      }, 1000);
    }
    pdfAnnotationsViewerApp.scrollAnnotationsPanel("#pdf-panel-"+source_uuid+" #annot-"+id);
    $(".annot", window.parent.document).css("background-color", "white");
    $("#annot-"+id, window.parent.document).css("background-color", "yellow");
  }
};
