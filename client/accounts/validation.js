$.validator.setDefaults({
    rules: {
        "address.address": {
            required: true,
            minlength: 2
        },
        "contacts.0.phone": {
            required: false,
            digits: true,
            // minlength:10,
            // maxlength:10
        },
        "baths": {
            required: true,
            range: [1,100]
        },
        "numBedRoomCount": {
            required: true,
            range: [1,100]
        },
        email: {
            email: true
        },
        // password: {
        //     required: true,
        //     minlength: 6
        // }
    },
    messages: {
        email: {
            required: "You must enter an email address.",
            email: "You've entered an invalid email address."
        },
        password: {
            required: "You must enter a password.",
            minlength: "Your password must be at least {0} characters."
        }
    }
});


window.LoginFormValidation = {
  username: function(username) {

    // Valid
    if (username.length >= 3) {
      return true;
    }

    // Invalid
    return {
      "error": "INVALID_USERNAME",
      "reason": "Username must be at least 3 characters long"
    };
  },

  mobile: function(mobile, optional) {

    mobile = mobile.trim();

    // Valid
    if (optional === true && mobile.length === 0) {
      return true;
    } else if (/^\d{10}$/.test(mobile)) {
      return true;
    }

    if(mobile.length === 0){//Removed 10 digit validation.
        // Invalid
        return {
            error: "INVALID_MOBILE",
            reason: "Please enter a valid mobile number"//"Please enter a valid 10 digit mobile number in format 0891234567"
        };
    }
    return true;
  },

  email: function(email, optional) {

    email = email.trim();
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    // Valid
    if (optional === true && email.length === 0) {
      return true;
    } else if( re.test(email) ){
      return true;
    }

    // Invalid
    return {
      error: "INVALID_EMAIL",
      reason: "Please enter a valid email address in format pat@gmail.com",
    };

  },

  password: function(password, options) {
    // Must have one number and/or symbol
    var validPasswordRegex = /^.*(?=.*[a-z])(?=.*[\d\W]).*$/;
    options = options || {};

    // Only check if a password has been entered at all.
    // This is usefull for the login forms
    if (options.validationLevel === 'exists') {
      if (password.length > 0) {
        return true;
      } else {
        return {
          error: "INVALID_PASSWORD",
          reason: "Password is required"
        }
      }
    }
    if (options.validationLevel === 'length') {
        if(password.length < 6 ){
            return {
                error: "INVALID_PASSWORD",
                reason: "Password must be at least 6 characters long"
            }
        }else if(password.length > 30 ){
            return {
                error: "INVALID_PASSWORD",
                reason: "Password must be less than 30 characters long"
            }
        }else return true;
    }

    // ---
    // Validate the password pased on some rules
    // This is useful for cases where a password needs to be created or updated.
    //



    if (password.length < 6) {
      return {
        error: "INVALID_PASSWORD",
        reason: "Password must be at least 6 characters long"
      }
    }

    if (password.match(validPasswordRegex) === null) {
      return {
        error: "INVALID_PASSWORD",
        reason: "Password must have one number and/or symbol",
      }
    }


    // Otherwise the password is valid
    return true
  }
};
