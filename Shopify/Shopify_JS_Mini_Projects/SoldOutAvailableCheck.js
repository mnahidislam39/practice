const isSoldOut = true;
const statusEL = document.getElementById("status");
const addCartBtn = document.getElementById("addCartBtn");

if (isSoldOut) {
  statusEL.innerText = "Sold Out";
  addCartBtn.disabled = true;
} else {
  statusEL.innerText = "Available";
  addCartBtn.disabled = false;
}
