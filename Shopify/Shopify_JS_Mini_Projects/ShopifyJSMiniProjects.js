// 1️⃣ Button Click Notification
const notifyBtn = document.getElementById("notifyBtn");
const notifyText = document.getElementById("notifyText");

notifyBtn.addEventListener("click", function () {
  notifyText.innerText = " Product added to cart!";
});

// 2️⃣ Quantity Control (+ / −)
let quantity = 1;
const maxQuantity = 10;
const quantityEl = document.getElementById("quantity");

document.getElementById("increase").addEventListener("click", function () {
  if (quantity < maxQuantity) {
    quantity++;
    quantityEl.innerText = quantity;
    console.log(quantity);
  }
});

document.getElementById("decrease").addEventListener("click", function () {
  if (quantity > 1) {
    quantity--;
    quantityEl.innerText = quantity;
    console.log(quantity);
  }
});

// 3️⃣ Price Calculator
