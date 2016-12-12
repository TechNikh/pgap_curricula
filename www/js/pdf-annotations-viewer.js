setTimeout(function() {
  console.log("rahul: setTimeout on load");
  pdfAnnotationsViewerApp.applyAnnotations();
  pdfAnnotationsViewerApp.openAnnotationsPanel();

  pdfAnnotationsViewerApp.scrollAnnotationsPanel("#num81");

}, 7000);

var pdfAnnotationsViewerApp = {
  applyAnnotations : function() {
    console.log("rahul: applyAnnotations");
    $('div.textLayer div')
        .each(
            function() {
              var contentfull = $(this).html();
              // console.log("rahul: " + contentfull);
              var newcontent = contentfull
                  .replace(
                      /the/g,
                      '<a style="background:red; margin-left: -2px;" href="#num81" target="_top">the </a>');
              console.log("rahul: " + newcontent);
              $(this).html(newcontent);
            });
  },
  openAnnotationsPanel : function() {
    $("#btn-panel-options", window.parent.document)[0].click();
  },
  scrollAnnotationsPanel : function(jquery_selector) {
    $(jquery_selector, window.parent.document)[0].scrollIntoView();
  }
};
