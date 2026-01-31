// const priceEl = document.querySelector("#price");

// const buyBtn = document.querySelector(".buy-btn ");

// buyBtn.addEventListener("click", function () {
//   //   priceEl.innerText = "$120";
//   //   priceEl.innerHTML = "<h1>$130</h1>";
//   alert("Button clicked!");
// });

// 5️⃣ Events (click, change)
// const variantSelect = document.querySelector("#variantSelect");
// const priceEL = document.querySelector("#price");

// variantSelect.addEventListener("change", function () {
//   priceEL.innerText = "$" + variantSelect.value;
// });

// 6️⃣ Real Shopify Practice ①
// const prices = document.querySelector("#prices");
// const variants = document.querySelector("#variants");

// variants.addEventListener("change", function () {
//   const selectOptions = variants.options[variants.selectedIndex];

//   const newPrice = selectOptions.getAttribute("data-price");

//   prices.innerText = "$" + newPrice;

//   console.log(newPrice);
// });

// 7️⃣ Real Shopify Practice ②
const productImage = document.querySelector("#productImage");
const variant = document.querySelector("#variant");

variant.addEventListener("change", function () {
  const selectOption = variant.options[variant.selectedIndex];
  const imageSrc = selectOption.getAttribute("data-image");

  productImage.src = imageSrc;

  console.log(selectOption);
});
