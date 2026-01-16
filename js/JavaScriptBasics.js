// 1️⃣ Variables
let quantity = 1; // এই ভেরিয়েবল 'quantity' রাখে, যা পরিমাণ track করবে। আমরা পরে + / − button এ update করব
const maxQuantity = 10; // এই 'const' পরিবর্তন করা যায় না। এটি max limit সেট করে, যেন বেশি add করা না যায়

/* 
✅ Shopify use case:
   Cart quantity tracking
   Max/min validation
*/

// 2️⃣ Functions

// Reusable code blocks
/*
function increaseQuantity() {  // একটি function যা quantity বাড়াবে
  quantity += 1;               // quantity 1 বাড়ানো হলো
  console.log("Quantity: " + quantity); // console-এ দেখানো হলো
}

function decreaseQuantity() {  // একটি function যা quantity কমাবে
  if (quantity > 1) {         // check করে quantity 1 এর নিচে না যায়
    quantity -= 1;            // কমানো হলো
  }
  console.log("Quantity: " + quantity); // console-এ দেখানো হলো
}


/*
✅ Shopify use case:

   / − button
   Variant selection logic
*/

// 3️⃣ If / Else Conditions
/*
if (quantity > maxQuantity) {            // যদি quantity max limit ছাড়ায়
  console.log("Maximum limit reached");  // console-এ দেখাবে
} else {                                 // অন্যথায়
  console.log("You can add more");       // quantity increase করা যাবে
}

*/
/*
✅ Shopify use case:
   Cart validation
   Sold out check
*/

// 4️⃣ Basic Operators
/*
let price = 100;                   // একটি product এর base price
let totalPrice = price * quantity; // total price calculate করা হলো
console.log("Total Price: $" + totalPrice); // console-এ দেখানো হলো

*/
/*
✅ Shopify use case:
   Price update on quantity change
*/

// 5️⃣ Practice Task 1: Button Click
// Goal: Click করলে text পরিবর্তন হবে
/*
const button = document.getElementById("btn");
const text = document.getElementById("text");
button.addEventListener("click", function () {
  text.innerText = "button clicked";
});
*/
/*
✅ Shopify use case:
   Add to cart click effect
   Notification update
*/

// 6️⃣ Practice Task 2: Quantity + / −
const quantityEl = document.getElementById("quantity");
document.getElementById("increase").addEventListener("click", function () {
  if (quantity < maxQuantity) {
    quantity++;
    quantityEl.innerText = quantity;
  }
});

document.getElementById("decrease").addEventListener("click", function () {
  if (quantity > 1) {
    quantity--;
    quantityEl.innerText = quantity;
  }
});
/*
✅ Shopify use case:
   Product page quantity control
*/
