"use strict";

var guestID = ''
var urlData = ''


const getCookie = (cookie_name) =>{
  // Construct a RegExp object as to include the variable name
  const re = new RegExp(`(?<=${cookie_name}=)[^;]*`);
  try{
    return document.cookie.match(re)[0];	// Will raise TypeError if cookie is not found
  }catch{
    return "Who Are You?";
  }
}

$(function() {
  if(getCookie('session') != 'Who Are You?'){
    if(getCookie('role') == 'false'){
      document.getElementById("userMenu").setAttribute("hidden", true);
    }else{
      document.getElementById("userMenu").removeAttribute("hidden");
    }
    guestID = window.localStorage.getItem('id');
    fetch("../env.json")
      .then(response => response.json())
      .then(json => urlData = json[0].local_url)
      .then(function(){
        getData(guestID, urlData)
      });
  }else{
    location.replace("auth-login.html")
  }
});

function resetForm() {
  document.getElementById("example-form").reset();
  document.getElementById('image-preview').style.backgroundImage='';
}

var signImage = '';
var ktpImage = '';


$('#kepKunjungan').change(function () {
  var optionSelected = $(this).find("option:selected");
  var valueSelected  = optionSelected.val();
  var textSelected   = optionSelected.text();
  if (valueSelected == 'Lainnya'){
    document.getElementById('kepKunjunganArea').removeAttribute('hidden');
    document.getElementById('kepKunjunganArea').setAttribute('required', true);
  }
  else{
    document.getElementById('kepKunjunganArea').setAttribute('hidden', true)
    document.getElementById('kepKunjunganArea').removeAttribute('required')
  }
  
});
// var element = {}, dataPrint = [];

async function getData(id, urlData){
  await $.ajax({
    url: `${urlData}guest/getGuest/` + id,
    type: 'GET',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": getCookie("session")
    },
    beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden");
    },
    success: function (result) {
      document.getElementById('name').value = result.data.name
      document.getElementById('email').value = result.data.email
      document.getElementById('nikNumber').value = result.data.nik
      document.getElementById('instansi').value = result.data.institution
      document.getElementById('phoneNumber').value = result.data.phoneNumber

      if(result.data.visitReason == "Layanan Colocation" || result.data.visitReason == "Pemeliharaan Server" || result.data.visitReason == "Pemeliharaan Data Center"){
        document.getElementById('kepKunjunganArea').setAttribute('hidden', true)
        document.getElementById('kepKunjunganArea').removeAttribute('required')
        $('#kepKunjungan').val(result.data.visitReason)
      }else{
        document.getElementById('kepKunjunganArea').removeAttribute('hidden');
        document.getElementById('kepKunjunganArea').setAttribute('required', true);
        $('#kepKunjungan').val("Lainnya")
        document.getElementById('kepKunjunganArea').value = result.data.visitReason
      }
      // result.data.departureTime == "None" ? document.getElementById('waktuKepulangan').value = '' : document.getElementById('waktuKepulangan').value = result.data.departureTime

      //assign sign image
      document.getElementById("ttd-preview").style.backgroundImage = `url(${urlData}uploads/ttd/${result.data.signImage})`
      document.getElementById("ttd-preview").style.height = "150px"
      document.getElementById("ttd-preview").style.width = "400px"
      document.getElementById("ttd-preview").style.backgroundSize = "cover"
      document.getElementById("ttd-preview").style.backgroundPosition = "center center"
      signImage = result.data.signImage

      //assign ktp image
      document.getElementById("image-preview").style.backgroundImage = `url(${urlData}uploads/ktp/${result.data.ktpImage})`
      document.getElementById("image-preview").style.height = "185px"
      document.getElementById("image-preview").style.width = "290px"
      document.getElementById("image-preview").style.backgroundSize = "cover"
      document.getElementById("image-preview").style.backgroundPosition = "center center"
      ktpImage = result.data.ktpImage

      // const d = new Date();
      // const months = ["Januari","Februari","Maret","April","Mai","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      
      // element.ktp = `${urlData}uploads/ktp/${result.data.ktpImage}`
      // element.sign = `${urlData}uploads/ttd/${result.data.signImage}`
      // element.name = result.data.name
      // element.date = `Bandung, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
      // element.number_form = `${d.getFullYear()}/${result.data.sr_number}/e-Gov`
      // element.sr_number = result.data.sr_number
      // dataPrint.push(element)

      // console.log(dataPrint)

    },
    complete: function () {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {
        var err = "Error " + " " + status + " " + p3 + " " + p4;
        if (xhr.responseText && xhr.responseText[0] == "{")
            err = JSON.parse(xhr.responseText).Message;
        iziToast.error({
          title: 'Gagal load data',
          message: `${err}`,
          position: 'topRight'
        })
        return false;
    }
  });
}

const exampleForm = document.getElementById("example-form");
exampleForm.addEventListener("submit", function(e){  

  e.preventDefault();

  if(document.getElementById('ttd-upload').value != '')
  {
    var signFormData = new FormData();
    var ttdUloadData = document.getElementById('ttd-upload').files[0]
    signFormData.append('file', ttdUloadData, ttdUloadData.name);

    //request for upload sign image 
    $.ajax({
      async: false,
      url: `${urlData}guest/uploaderTTD`,
      type: 'POST',
      data: signFormData,
      contentType: false,
      cache: false,
      processData: false,
      headers: {
        "Authorization": getCookie("session")
      },
      beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden"); 
      },
      success: function (result) {
          // element is div holding the ParticalView
          // console.log(result.data.fileName)
          // document.getElementById("overlay").setAttribute("hidden", false);     
          // iziToast.success({
          //   title: 'Tanda tangan berhasil disimpan',
          //   message: ``,
          //   position: 'topRight'
          // })
          signImage = result.data.fileName
      },
      complete: function (responseJSON) {
        document.getElementById("overlay").setAttribute("hidden", false);
      },
      error: function (xhr, status, p3, p4) {
        console.log(xhr)
      }
    }).fail(function (xhr, responseJSON, result, data) {
      // ignore the error and do nothing else
      
      iziToast.error({
        title: 'Gagal menyimpan tanda tangan',
        message: `Unauthorized with error code ${xhr.status}`,
        position: 'topRight'
      })          
      return false;
    });
  }


  if(document.getElementById('image-upload').value != '')
  {
    //request for upload ktp image
    var ktpFormData = new FormData();
    var ktpUploaData = document.getElementById('image-upload').files[0]
    ktpFormData.append('file', ktpUploaData, ktpUploaData.name);

    $.ajax({
      async: false,
      url: `${urlData}guest/uploaderKTP`,
      type: 'POST',
      data: ktpFormData,
      contentType: false,
      cache: false,
      processData: false,
      headers: {
        "Authorization": getCookie("session")
      },
      beforeSend: function () {
        document.getElementById("overlay").removeAttribute("hidden"); 
      },
      success: function (result) {
          // element is div holding the ParticalView
          // console.log(result.data.fileName)
          // document.getElementById("overlay").setAttribute("hidden", false);     
          // iziToast.success({
          //   title: 'KTP berhasil disimpan',
          //   message: ``,
          //   position: 'topRight'
          // })
          ktpImage = result.data.fileName
      },
      complete: function (responseJSON) {
        document.getElementById("overlay").setAttribute("hidden", false);
      },
      error: function (xhr, status, p3, p4) {
      }
    }).fail(function (xhr, responseJSON, result, data) {
      // ignore the error and do nothing else
      
      iziToast.error({
        title: 'Gagal menyimpan KTP',
        message: `Unauthorized with error code ${xhr.status}`,
        position: 'topRight'
      })            
      return false;
    });
  }

  var nama = document.getElementById('name').value
  var email = document.getElementById('email').value
  var nik = document.getElementById('nikNumber').value
  var instansi =  document.getElementById('instansi').value
  var phone =  document.getElementById('phoneNumber').value
  var kepKunjungan = ''
  if(document.getElementById('kepKunjungan').value == 'Lainnya'){
    kepKunjungan = document.getElementById('kepKunjunganArea').value
  }else{
    kepKunjungan = document.getElementById('kepKunjungan').value
  }
  //Obj of data to send in future like a dummyDb

  const data = { 
    name:nama.toUpperCase(),
    email:email,
    nik:String(nik),
    institution:instansi,
    phoneNumber:String(phone).trim(),
    visitReason:kepKunjungan,
    ktpImage:String(ktpImage), //
    signImage:String(signImage)
  };

  $.ajax({
    async: false,
    url: `${urlData}guest/update/` + guestID,
    type: 'PUT',
    headers: {
      "Authorization": getCookie("session")
    },
    data: JSON.stringify(data),
    datatype: 'json',
    contentType: 'application/json',
    beforeSend: function () {
      document.getElementById("overlay").removeAttribute("hidden"); 
    },
    success: function (result) {
        // element is div holding the ParticalView
        if(result.error)
        {
          iziToast.error({
            title: 'Gagal Merubah Data',
            message: ``,
            position: 'topRight'
          })  
        }else{
          document.getElementById("overlay").setAttribute("hidden", false);     
          iziToast.success({
            title: 'Update data berhasil',
            message: `Update data dengan nama ${result.data.name} berhasil diubah`,
            position: 'topRight'
          })
        }
        setTimeout(() => {
          window.location.replace("index.html")
        }, 1500)
    },
    complete: function (responseJSON) {
      document.getElementById("overlay").setAttribute("hidden", false);
    },
    error: function (xhr, status, p3, p4) {      
    }
  }).fail(function (xhr, responseJSON, result, data) {
    // ignore the error and do nothing else
    
    iziToast.error({
      title: 'Gagal Merubah Data',
      message: `Unauthorized with error code ${xhr.status}`,
      position: 'topRight'
    })        
    setTimeout(() => {
      window.location.replace("nda-form-edit.html")
    }, 1500)        
    return false;
  });
});

// section library function
$.uploadPreview({
  input_field: "#image-upload",   // Default: .image-upload
  preview_box: "#image-preview",  // Default: .image-preview
  label_field: "#image-label",    // Default: .image-label
  label_default: "Choose File",   // Default: Choose File
  label_selected: "Change File",  // Default: Change File
  no_label: false,                // Default: false
  success_callback: null          // Default: null
});
$.uploadPreview({
  input_field: "#ttd-upload",   // Default: .image-upload
  preview_box: "#ttd-preview",  // Default: .image-preview
  label_field: "#ttd-label",    // Default: .image-label
  label_default: "Choose File",   // Default: Choose File
  label_selected: "Change File",  // Default: Change File
  no_label: false,                // Default: false
  success_callback: null          // Default: null
});

var cleavePN = new Cleave('.phone-number', {
  phone: true,
  phoneRegionCode: 'id'
});

$('.daterange-cus').daterangepicker({
  locale: {format: 'YYYY-MM-DD'},
  drops: 'down',
  opens: 'right'
});
$('.daterange-btn').daterangepicker({
  ranges: {
    'Today'       : [moment(), moment()],
    'Yesterday'   : [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 7 Days' : [moment().subtract(6, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month'  : [moment().startOf('month'), moment().endOf('month')],
    'Last Month'  : [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  },
  startDate: moment().subtract(29, 'days'),
  endDate  : moment()
}, function (start, end) {
  $('.daterange-btn span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'))
});
$(".inputtags").tagsinput('items');

// end of section library function