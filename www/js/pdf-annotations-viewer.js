setTimeout(function() {
  console.log("rahul: setTimeout on load");
  pdfAnnotationsViewerApp.applyAnnotations();
  //pdfAnnotationsViewerApp.openAnnotationsPanel();

  //pdfAnnotationsViewerApp.scrollAnnotationsPanel("#num81");

}, 7000);

var pdfAnnotationsViewerApp = {
  applyAnnotations : function() {
    console.log("rahul: applyAnnotations");
    $('div.textLayer div')
        .each(
            function() {
              var contentfull = $(this).html();
              // console.log("rahul: " + contentfull);
              $.each(parent.annotationsObject, function(i, el) {
                console.log("bannu : annotationsObject " + i);
                var re = new RegExp(i,"g");
                contentfull = contentfull
                .replace(
                    re,
                    '<span onclick="pdfAnnotationsViewerApp.onClickOfAnnotationQuote(\''+el.id+'\', \''+el.source_uuid+'\')" style="background:yellow; margin-left: -2px;">'+i+' </span>');
                console.log("bannu : span onclick " + '<span onclick="pdfAnnotationsViewerApp.onClickOfAnnotationQuote(\''+el.id+'\')" style="');
              });
              console.log("bannu: " + contentfull);
              $(this).html(contentfull);
            });
  },
  openAnnotationsPanel : function(jquery_selector) {
    $(jquery_selector, window.parent.document)[0].click();
  },
  scrollAnnotationsPanel : function(jquery_selector) {
    $(jquery_selector, window.parent.document)[0].scrollIntoView();
  },
  onClickOfAnnotationQuote : function(id, source_uuid) {
    pdfAnnotationsViewerApp.openAnnotationsPanel('#btn-panel-'+source_uuid);
    pdfAnnotationsViewerApp.scrollAnnotationsPanel("#pdf-panel-"+source_uuid+" #annot-"+id);
    $(".annot", window.parent.document).css("background-color", "white");
    $("#annot-"+id, window.parent.document).css("background-color", "yellow");
  }
};
