const showPopup = document.getElementById("showPopup");
const popup = document.getElementById("popup");
const closePopup = document.getElementById("closePopup");

showPopup.addEventListener("click", function () {
  popup.style.display = "block";
});

closePopup.addEventListener("click", function () {
  popup.style.display = "none";
});
