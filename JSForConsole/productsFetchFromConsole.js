(function () {
  let products = [];
  let items = document.querySelectorAll(".itemIN");

  items.forEach((item) => {
    let nameElement = item.querySelector("h3 a");
    let refElement = item.querySelector("h3 b");

    let productName = "N/A";
    let productURL = "N/A";
    let reference = "N/A";

    if (nameElement) {
      let fullText = nameElement.innerText.trim();
      let textParts = fullText.split("\n");
      productName = textParts[textParts.length - 1].trim();
      productUrl = nameElement.href;
    }

    if (refElement) {
      reference = refElement.innerText.trim();
    }

    let priceContainer = item.querySelector("h5");
    let currentPrice = "N/A";
    let oldPrice = "N/A";

    if (priceContainer) {
      if (priceContainer.childNodes.length > 0) {
        currentPrice = priceContainer.childNodes[0].textContent.trim();
      }
      let sTag = priceContainer.querySelector("s");

      if (sTag) {
        oldPrice = sTag.innerText.trim();
      }
    }

    let imgElement = item.querySelector("img.default-img");
    let imageUrl = imgElement ? imgElement.src : "N/A";

    if (productName !== "N/A") {
      products.push({
        "Product Name": productName,
        Referemce: reference,
        "Current Price": currentPrice,
        "Old Price": oldPrice,
        "Imge URL": imageUrl,
        "produc tURL": productUrl,
      });
    }
  });

  if (products.length > 0) {
    console.table(products);
    console.log("Total Found: " + products.length);

    let headers = Object.keys(products[0]).join(",");
    let rows = products
      .map((p) => {
        return Object.values(p)
          .map((val) => `"${val.toString().replace(/"/g, '""')}"`)
          .join(",");
      })
      .join("\n");

    let csvContent = headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "kangroute_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("Descare.");
  } else {
    console.log("No Product founds");
  }
})();
