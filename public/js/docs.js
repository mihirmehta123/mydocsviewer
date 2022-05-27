$("a").click(function(){

  $("a").css("font-weight", "normal");
  $("a").css("color", "#939799");
  $(".arrow").remove();

  let fileId = $(this).attr('id');
  $("#doc-view").attr("src", "/file/"+fileId);
  $(this).append('<span class="arrow">&#9654;</span>');
  $(this).css("font-weight", "bold");
  $(this).css("color", "#4285F4");



});
