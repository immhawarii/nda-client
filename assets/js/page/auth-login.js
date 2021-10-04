"use strict";

const getCookie = (cookie_name) =>{
  // Construct a RegExp object as to include the variable name
  const re = new RegExp(`(?<=${cookie_name}=)[^;]*`);
  try{
    return document.cookie.match(re)[0];	// Will raise TypeError if cookie is not found
  }catch{
    return "Who Are You?";
  }
}
$(".toggle-password").click(function() {

  $(this).toggleClass("fa-eye fa-eye-slash");
  var input = $($(this).attr("toggle"));
  if (input.attr("type") == "password") {
    input.attr("type", "text");
  } else {
    input.attr("type", "password");
  }
});

var urlData = ''
fetch("../env.json")
  .then(response => response.json())
  .then(json => urlData = json[0].local_url);

const userForm = document.getElementById("loginFormData");
userForm.addEventListener("submit", function(e){  
  e.preventDefault();
  
  var userEmail = document.getElementById('userEmail').value
  var userPassword = document.getElementById('userPassword').value

  // //Obj of data to send in future like a dummyDb
  const data = { 
    email: userEmail,
    password: userPassword
  };  
  
  var now = new Date();
  var time = now.getTime();
  time += 3600 * 1000;
  now.setTime(time);
  var expires = "expires=" + now.toUTCString();

  $.ajax({
    url: `${urlData}user/login`,
    type: 'POST',
    data: JSON.stringify(data),
    datatype: 'json',
    contentType: 'application/json',
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {
        // element is div holding the ParticalView
        console.log(result)
        if(result.error == true)
        {
          iziToast.error({
            title: 'Login Gagal',
            message: `${result.message}`,
            position: 'topRight'
          }) 
          setTimeout(() => {
            location.reload()
          }, 1500)           
        }
        else{
          document.cookie = `session=Bearer ${result.data.token}; ${expires}`
          document.cookie = `user name= ${result.data.name}; ${expires}`
          document.cookie = `role= ${result.data.role}; ${expires}`
          if(getCookie('session') != 'Who Are You')
          {
            window.location.href  = 'index.html'
          }
        }
          
    },
    complete: function (responseJSON) {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
    }
  }).fail(function (responseJSON, result, data) {
      // ignore the error and do nothing else
      iziToast.error({
        title: 'Login Gagal',
        message: `${responseJSON.responseJSON.message}`,
        position: 'topRight'
      })            
  });
});