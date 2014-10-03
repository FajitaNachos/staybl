$("#contact-us").on("click", function(e) {
  e.preventDefault();
  
    $.ajax({
        url: $(this).attr("href"),
        success: function(data) {
            $(data).appendTo("body");
            $('#contact-modal').modal();

            $("#contact-form").on("ajax:success", function(e, data, status, xhr) {
                console.log(e, data, status, xhr);
            });

            $("#contact-form").on("ajax:error", function(e, data, status, xhr) {
                console.log(data, status);
            });

        }
    });
});




