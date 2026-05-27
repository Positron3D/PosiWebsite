// Mobile nav toggle
document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav__toggle");
  var nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // collapse on link tap (but let dropdown parent toggle open)
    nav.querySelectorAll(".nav__links a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (a.getAttribute("href") === "#") { e.preventDefault(); return; }
        nav.classList.remove("open");
      });
    });
  }
});
