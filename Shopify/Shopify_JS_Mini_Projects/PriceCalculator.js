// 3️⃣ Price Calculator
let price = 100;
let quantity = 1;

const priceEl = document.getElementById("price");

const totalEl = document.getElementById("total");

document.getElementById("increase").addEventListener("click", function () {
  quantity++;
  totalEl.innerText = price * quantity;
});

document.getElementById("decrease").addEventListener("click", function () {
  if (quantity > 1) {
    quantity--;
    totalEl.innerText = price * quantity;
  }
});
