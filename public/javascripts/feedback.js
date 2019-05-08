// validate contact form
$(function() {
  $('#contact').validate({
    rules: {
      name: {
        required: true,
        minlength: 2
      },
      email: {
        required: true,
        email: true
      },
      message: {
        required: true
      }
    },
    messages: {
      name: {
        required: "Come on, you have a name don't you?",
        minlength: "Your name must consist of at least 2 characters"
      },
      email: {
        required: "No email, no message!"
      },
      message: {
        required: "Umm...yea, you have to write something to send this form.",
      }
    },
    submitHandler: function(form) {
      $.ajax({
        type:"POST",
        data: $(form).serialize(),
        url:"/send_email",
        success: function() {
          $('#contact :input').attr('disabled', 'disabled');
          $('#contact').fadeTo( "slow", 0.15, function() {
            $(this).find(':input').attr('disabled', 'disabled');
            $(this).find('label').css('cursor','default');
            $('.alert-success').fadeIn();
          });
        },
        error: function() {
          $('#contact').fadeTo( "slow", 0.15, function() {
            $('.alert-danger').fadeIn();
          });
        }
      });
      return false;
    }
  });
});
