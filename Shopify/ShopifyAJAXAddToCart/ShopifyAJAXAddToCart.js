const addToCartBtn = document.querySelector("#addToCart");
const statusEl = document.querySelector("#status");

// button থেকে variant id নেওয়া
const variantId = addToCartBtn.getAttribute("data-variant-id");

// 4️⃣ AJAX Add to Cart (CORE PART)
addToCartBtn.addEventListener("click", function () {
  fetch("/cart/add.js", {
    method: "POST", //shopify expect POST
    headers: {
      "content-Type": "application/json",
    },
    body: JSON.stringify({
      id: variantId, // variant id
      quantity: 1, // koto quantity add hobe
    }),
  })
    .then(function (response) {
      return response.json(); // response JSON a convert
    })
    .then(function (data) {
      // success hole
      statusEl.innerText = "Product added to cart!";
      console.log("added:", data);
    })
    .catch(function (error) {
      // error hole
      statusEl.innerText = "something went wrong";
      console.error(error);
    });
});
