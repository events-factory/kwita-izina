/*  ---------------------------------------------------
    Template Name: Manup
    Description: Manup Event HTML Template
    Author: Colorlib
    Author URI: http://colorlib.com
    Version: 1.0
    Created: Colorlib
---------------------------------------------------------  */

"use strict";

(function ($) {
  /*------------------
        Preloader
    --------------------*/

  /*------------------
        Background Set
    --------------------*/
  $(".set-bg").each(function () {
    var bg = $(this).data("setbg");
    $(this).css("background-image", "url(" + bg + ")");
  });

  /*------------------
    Navigation
  --------------------*/
  $(".mobile-menu").slicknav({
    prependTo: "#mobile-menu-wrap",
    allowParentLinks: true,
  });

  /*------------------------
    Partner Slider
    ----------------------- */
  $(".partner-logo").owlCarousel({
    items: 6,
    dots: false,
    autoplay: true,
    loop: true,
    smartSpeed: 1200,
    margin: 116,
    responsive: {
      320: {
        items: 2,
      },
      480: {
        items: 3,
      },
      768: {
        items: 4,
      },
      992: {
        items: 5,
      },
      1200: {
        items: 6,
      },
    },
  });

  /*------------------------
    Testimonial Slider
    ----------------------- */
  $(".testimonial-slider").owlCarousel({
    items: 2,
    dots: false,
    autoplay: false,
    loop: true,
    smartSpeed: 1200,
    nav: true,
    navText: [
      "<span class='fa fa-angle-left'></span>",
      "<span class='fa fa-angle-right'></span>",
    ],
    responsive: {
      320: {
        items: 1,
      },
      768: {
        items: 2,
      },
    },
  });

  /*------------------
        Magnific Popup
    --------------------*/
  $(".video-popup").magnificPopup({
    type: "iframe",
  });

  /*------------------
        CountDown
    --------------------*/
  // For demo preview
  var today = new Date();
  var dd = String(today.getDate()).padStart(2, "0");
  var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
  var yyyy = today.getFullYear();

  if (mm == 12) {
    mm = "01";
    yyyy = yyyy + 1;
  } else {
    mm = parseInt(mm) + 1;
    mm = String(mm).padStart(2, "0");
  }
  var timerdate = mm + "/" + dd + "/" + yyyy;
  // For demo preview end

  // Use this for real timer date
  /*  var timerdate = "2020/01/01"; */

  $("#countdown").countdown(timerdate, function (event) {
    $(this).html(
      event.strftime(
        "<div class='cd-item'><span>%D</span> <p>Days</p> </div>" +
        "<div class='cd-item'><span>%H</span> <p>Hrs</p> </div>" +
        "<div class='cd-item'><span>%M</span> <p>Mins</p> </div>" +
        "<div class='cd-item'><span>%S</span> <p>Secs</p> </div>"
      )
    );
  });
})(jQuery);

var countDownDate = new Date("Oct 20, 2024 07:00:00").getTime();

var x = setInterval(function () {
  var now = new Date().getTime();

  var distance = countDownDate - now;

  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  $("#days").text(days);
  $("#hours").text(hours);
  $("#minutes").text(minutes);
  $("#seconds").text(seconds);
  if (distance < 0) {
    clearInterval(x);
    document.getElementById("demo").innerHTML = "EXPIRED";
  }
}, 1000);

const redirectURL = "index.html";

function erazeAllCredentials() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    keys.push(localStorage.key(i));
  }

  keys.forEach(function (key) {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });

  if (!window.location.href.endsWith("index.html")) {
    window.location.href = redirectURL;
  }
}

function checkSession(minutes) {
  const currentLocation = window.location.href;
  if (Object.keys(localStorage).length <= 1) {
    if (!currentLocation.endsWith("index.html") && !currentLocation.endsWith("diversity.html")) {
      window.location.href = redirectURL;
    }
  } else {
    if (!localStorage.getItem('startTime')) {
      localStorage.setItem('startTime', new Date().getTime());
    }

    const limitTime = minutes * 60 * 1000;

    const checkTime = setInterval(() => {
      const storedTime = parseInt(localStorage.getItem('startTime'), 10);
      const elapsedTime = new Date().getTime() - storedTime;
      const remainingTime = limitTime - elapsedTime;
    
      const minutes = Math.floor(remainingTime / 60000); // Convert milliseconds to minutes
      const seconds = Math.floor((remainingTime % 60000) / 1000); // Convert remaining milliseconds to seconds
    
      if (remainingTime <= 0) {
        console.log("Session expired");
        erazeAllCredentials();
        clearInterval(checkTime);
      } else if (minutes > 0) {
        $('#remainingtime').text(`${minutes} minute(s) ${seconds} second(s)`)
      } else {
        console.log(`Remaining time: ${seconds} second(s)`);
        // alert('Your current session has expired !')
        if (!currentLocation.endsWith("index.html") && !currentLocation.endsWith("diversity.html")) {
          window.location.href = redirectURL;
        }
      }
    }, 500);
    
  }
}

$('#logout-btn').on('click', function () {
});