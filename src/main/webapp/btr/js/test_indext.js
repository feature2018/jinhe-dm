$(document).ready( function() {
  

  
  $('body').on("click", ".submanu li a", function(){
    var title = $(this).data('title');
    $('.title').children('h2').html(title);
  });
});