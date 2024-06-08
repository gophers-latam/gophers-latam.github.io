document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-button");
  var menu = document.querySelector(".nav-links");

  function hideMenu() {
    menu.classList.add("hide-on-mobile");
    menu.classList.remove("show-on-mobile");
  }

  menuButton.addEventListener("click", function () {
    let menuClass = menu.classList;
    if (menuClass.contains("show-on-mobile")) {
      hideMenu();
    } else {
      menu.classList.add("show-on-mobile");
      menu.classList.remove("hide-on-mobile");
    }
  });

  menu.addEventListener("click", hideMenu);
});
