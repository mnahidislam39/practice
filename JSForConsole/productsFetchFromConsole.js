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

// এই সমস্যা সমাধানের জন্য আমাদের localStorage ব্যবহার করতে হবে, যা পেজ রিফ্রেশ হলেও ডাটা সেভ করে রাখবে।

// (function () {
//   let savedProducts = JSON.parse(localStorage.getItem("scraped_data")) || [];
//   console.log(
//     `Current session: Found ${savedProducts.length} products so far.`,
//   );

//   let items = document.querySelectorAll(".itemIN");
//   items.forEach((item) => {
//     let nameElement = item.querySelector("h3 a");
//     let refElement = item.querySelector("h3 b");
//     let priceContainer = item.querySelector("h5");
//     let imgElement = item.querySelector("img.default-img");

//     if (nameElement) {
//       let fullText = nameElement.innerText.trim();
//       let textParts = fullText.split("\n");
//       let productName = textParts[textParts.length - 1].trim();

//       savedProducts.push({
//         "Product Name": productName,
//         Reference: refElement ? refElement.innerText.trim() : "N/A",
//         "Current Price": priceContainer
//           ? priceContainer.childNodes[0].textContent.trim()
//           : "N/A",
//         "Old Price": item.querySelector("h5 s")
//           ? item.querySelector("h5 s").innerText.trim()
//           : "N/A",
//         "Image URL": imgElement ? imgElement.src : "N/A",
//         "Product URL": nameElement.href,
//       });
//     }
//   });

//   localStorage.setItem("scraped_data", JSON.stringify(savedProducts));

//   let paginationLinks = document.querySelectorAll(".paginas a, .pagination a");
//   let nextButton = Array.from(paginationLinks).find(
//     (a) => a.innerText.includes("»") || a.textContent.includes("»"),
//   );

//   if (
//     nextButton &&
//     nextButton.getAttribute("href") &&
//     nextButton.getAttribute("href") !== "#"
//   ) {
//     console.log("Moving to the next page in 3 seconds...");
//     setTimeout(() => {
//       nextButton.click();
//     }, 3000);
//   } else {
//     console.log("ALL PAGES FINISHED! Run the download script now.");
//     console.table(savedProducts);
//   }
// })();

//
(async function () {
  let allProducts = [];
  let pageCount = 1;

  function extractData() {
    let items = document.querySelectorAll(".itemIN");
    items.forEach((item) => {
      let nameElement = item.querySelector("h3 a");
      let refElement = item.querySelector("h3 b");
      let priceContainer = item.querySelector("h5");
      let imgElement = item.querySelector("img.default-img");

      if (nameElement) {
        let fullText = nameElement.innerText.trim();
        let textParts = fullText.split("\n");
        let productName = textParts[textParts.length - 1].trim();

        allProducts.push({
          "Product Name": productName,
          Reference: refElement ? refElement.innerText.trim() : "N/A",
          "Current Price": priceContainer
            ? priceContainer.childNodes[0].textContent.trim()
            : "N/A",
          "Old Price": item.querySelector("h5 s")
            ? item.querySelector("h5 s").innerText.trim()
            : "N/A",
          "Image URL": imgElement ? imgElement.src : "N/A",
          "Product URL": nameElement.href,
        });
      }
    });
  }

  async function startScraping() {
    console.log("Scraping started...");

    let hasNextPage = true;

    while (hasNextPage) {
      console.log(
        `Extracting Page ${pageCount}... Total products so far: ${allProducts.length}`,
      );
      extractData();

      let paginationLinks = document.querySelectorAll(
        ".paginas a, .pagination a",
      );
      let nextButton = Array.from(paginationLinks).find(
        (a) => a.innerText.includes("»") || a.textContent.includes("»"),
      );

      if (
        nextButton &&
        nextButton.getAttribute("href") &&
        nextButton.getAttribute("href") !== "#" &&
        !nextButton.closest("li")?.classList.contains("active")
      ) {
        console.log("Moving to the next page...");
        nextButton.click();
        pageCount++;

        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        console.log("Finished! No more pages to scrape.");
        hasNextPage = false; // লুপ বন্ধ হবে
      }
    }

    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) {
      console.log("No data found.");
      return;
    }

    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    let csvContent = headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = `kangroute_full_report_${allProducts.length}_products.csv`;
    link.click();

    console.log(`Success! Total ${allProducts.length} products exported.`);
  }
  startScraping();
})();

// working and going next page but nex page er  data nicche na
(async function () {
  let allProducts = [];
  let processedPages = new Set();
  function extractData() {
    let items = document.querySelectorAll(".itemIN");
    let initialCount = allProducts.length;

    items.forEach((item) => {
      let nameElement = item.querySelector("h3 a");
      let refElement = item.querySelector("h3 b");
      let priceContainer = item.querySelector("h5");
      let imgElement = item.querySelector("img.default-img");

      if (nameElement) {
        let fullText = nameElement.innerText.trim();
        let textParts = fullText.split("\n");
        let productName = textParts[textParts.length - 1].trim();
        let productUrl = nameElement.href;

        if (!allProducts.some((p) => p["Product URL"] === productUrl)) {
          allProducts.push({
            "Product Name": productName,
            Reference: refElement ? refElement.innerText.trim() : "N/A",
            "Current Price": priceContainer
              ? priceContainer.childNodes[0].textContent.trim()
              : "N/A",
            "Old Price": item.querySelector("h5 s")
              ? item.querySelector("h5 s").innerText.trim()
              : "N/A",
            "Image URL": imgElement ? imgElement.src : "N/A",
            "Product URL": productUrl,
          });
        }
      }
    });
    return allProducts.length > initialCount;
  }

  async function startScraping() {
    console.log("Scraping started on AJAX pagination...");

    let hasMorePages = true;

    while (hasMorePages) {
      extractData();
      console.log(`Current Total: ${allProducts.length} products collected.`);

      let activePageEl = document.querySelector("#paginator b");
      let currentPageNum = activePageEl ? activePageEl.innerText.trim() : "1";
      processedPages.add(currentPageNum);

      let nextButton = document.querySelector("#paginator a:last-child");

      if (nextButton && nextButton.querySelector('img[src*="pagiDER"]')) {
        console.log(`Clicking next page after page ${currentPageNum}...`);
        nextButton.click();

        await new Promise((resolve) => setTimeout(resolve, 4000));

        let newPageNum = document
          .querySelector("#paginator b")
          ?.innerText.trim();
        if (processedPages.has(newPageNum)) {
          console.log("No new page detected. Stopping.");
          hasMorePages = false;
        }
      } else {
        console.log("No more pages left to click.");
        hasMorePages = false;
      }
    }

    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return console.log("No data found.");

    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    let csvContent = headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = `kangroute_all_data_${allProducts.length}.csv`;
    link.click();
    console.log(`Done! Total ${allProducts.length} products downloaded.`);
  }

  startScraping();
})();

// working by page nagivation
(async function () {
  let allProducts = [];
  let currentPage = 1;

  function extractData() {
    let items = document.querySelectorAll(".itemIN");
    let addedInThisPage = 0;

    items.forEach((item) => {
      let nameElement = item.querySelector("h3 a");
      let refElement = item.querySelector("h3 b");
      let priceContainer = item.querySelector("h5");
      let imgElement = item.querySelector("img.default-img");

      if (nameElement) {
        let fullText = nameElement.innerText.trim();
        let textParts = fullText.split("\n");
        let productName = textParts[textParts.length - 1].trim();
        let productUrl = nameElement.href;

        if (!allProducts.some((p) => p["Product URL"] === productUrl)) {
          allProducts.push({
            "Product Name": productName,
            Reference: refElement ? refElement.innerText.trim() : "N/A",
            "Current Price": priceContainer
              ? priceContainer.childNodes[0].textContent.trim()
              : "N/A",
            "Old Price": item.querySelector("h5 s")
              ? item.querySelector("h5 s").innerText.trim()
              : "N/A",
            "Image URL": imgElement ? imgElement.src : "N/A",
            "Product URL": productUrl,
          });
          addedInThisPage++;
        }
      }
    });
    console.log(
      `Page ${currentPage}: Added ${addedInThisPage} products. Total: ${allProducts.length}`,
    );
  }

  async function startScraping() {
    console.log("Scraping started... Please don't close the tab.");

    while (true) {
      extractData();

      let activePageNode = document.querySelector("#paginator b");
      let nextButton = activePageNode
        ? activePageNode.nextElementSibling
        : null;

      if (nextButton && nextButton.tagName === "SPAN") {
        nextButton = nextButton.nextElementSibling;
      }

      if (
        nextButton &&
        nextButton.tagName === "A" &&
        !nextButton.querySelector("img")
      ) {
        console.log(`Navigating to Page ${nextButton.innerText}...`);

        nextButton.click();
        currentPage++;

        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        let arrowNext = document.querySelector(
          '#paginator img[src*="pagiDER"]',
        )?.parentElement;
        if (arrowNext && arrowNext !== nextButton) {
          console.log("Clicking Next Arrow...");
          arrowNext.click();
          currentPage++;
          await new Promise((resolve) => setTimeout(resolve, 5000));

          let newItems = document.querySelectorAll(".itemIN");
          if (
            newItems.length > 0 &&
            !allProducts.some(
              (p) =>
                p["Product URL"] === newItems[0].querySelector("h3 a")?.href,
            )
          ) {
            continue;
          }
        }

        console.log("All pages processed.");
        break;
      }
    }

    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return console.log("No data collected.");

    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    let csvContent = headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = `kangroute_full_catalog_${allProducts.length}.csv`;
    link.click();
    console.log("Download complete!");
  }

  startScraping();
})();

//
(async function () {
  let allProducts = [];
  let productLinks = [];

  function collectLinks() {
    let items = document.querySelectorAll(".itemIN h3 a");
    items.forEach((a) => {
      if (!productLinks.includes(a.href)) productLinks.push(a.href);
    });
  }

  async function scrapeProductDetails(url) {
    try {
      console.log(`Fetching details for: ${url}`);
      let response = await fetch(url);
      let html = await response.text();
      let parser = new DOMParser();
      let doc = parser.parseFromString(html, "text/html");

      let name = doc.querySelector("h1")?.innerText.trim() || "N/A";
      let ref =
        doc.querySelector("h4")?.innerText.replace("REF:", "").trim() || "N/A";

      let images = Array.from(doc.querySelectorAll("#itemimatges img")).map(
        (img) => img.src,
      );
      if (images.length === 0)
        images.push(doc.querySelector("#my_image")?.src || "N/A");

      let sizes = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter((s) => !s.includes("--") && s !== "");

      let shortDesc = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => li.innerText.trim())
        .join(" | ");
      let fullDescription = `${shortDesc} Features: ${features}`;

      let priceText =
        doc.querySelector(".haches5 h5")?.innerText.trim() || "N/A";

      return {
        "Product Name": name,
        Reference: ref,
        Price: priceText,
        Sizes: sizes.join(", "),
        "All Images": images.join(" | "),
        Description: fullDescription,
        URL: url,
      };
    } catch (e) {
      console.error(`Error fetching ${url}:`, e);
      return null;
    }
  }

  async function main() {
    console.log("Step 1: Collecting product links from current page...");
    collectLinks();

    console.log(
      `Step 2: Found ${productLinks.length} products. Starting deep scrape...`,
    );

    for (let i = 0; i < productLinks.length; i++) {
      let details = await scrapeProductDetails(productLinks[i]);
      if (details) allProducts.push(details);

      await new Promise((r) => setTimeout(r, 500));

      if ((i + 1) % 5 === 0)
        console.log(`Progress: ${i + 1}/${productLinks.length} completed...`);
    }

    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return console.log("No data found.");

    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    let csvContent = "\uFEFF" + headers + "\n" + rows; // UTF-8 BOM for Excel
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let url = URL.createObjectURL(blob);
    let link = document.createElement("a");
    link.href = url;
    link.download = `kangroute_detailed_data_${allProducts.length}.csv`;
    link.click();
    console.log("Success! Detailed CSV downloaded.");
  }

  main();
})();

// ১. কোন প্রোডাক্টে ঢুকছে তার নাম বলবে। ২. ঐ প্রোডাক্টের ভেতরে কয়টি ছবি এবং কয়টি সাইজ পাওয়া গেল তা জানাবে। ৩. ডাটা নেয়া শেষ হলে পরেরটিতে যাবে। ৪. পেজ শেষ হলে পরবর্তী পেজে যাওয়ার ঘোষণা দিবে।
(async function () {
  let allProducts = [];
  let pageCount = 1;

  // ১. সিঙ্গেল প্রোডাক্ট পেজ থেকে ডাটা সংগ্রহের ফাংশন
  async function getProductDetails(url, productName) {
    try {
      console.log(
        `%c >> প্রবেশ করছি: ${productName}`,
        "color: #3498db; font-weight: bold;",
      );

      let response = await fetch(url);
      let text = await response.text();
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ইমেজ খোঁজা
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];
      console.log(`   - ছবি পাওয়া গেছে: ${uniqueImages.length} টি`);

      // সাইজ খোঁজা
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );
      console.log(
        `   - সাইজ পাওয়া গেছে: ${sizeOptions.length} টি (${sizeOptions.join(", ")})`,
      );

      // ডেসক্রিপশন
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => li.innerText.trim())
        .join("; ");
      let fullDescription = (intro + " Features: " + features).trim();
      console.log(`   - ডেসক্রিপশন সংগ্রহ সফল।`);

      return {
        allImages: uniqueImages.join(" | "),
        sizes: sizeOptions.join(", "),
        desc: fullDescription,
      };
    } catch (err) {
      console.error(`   !! ${productName} এর তথ্য নিতে সমস্যা হয়েছে।`);
      return { allImages: "N/A", sizes: "N/A", desc: "N/A" };
    }
  }

  // ২. মেইন স্ক্র্যাপার লজিক
  async function start() {
    console.log(
      "%c স্ক্র্যাপার চালু হয়েছে... দয়া করে ট্যাব বন্ধ করবেন না।",
      "background: #222; color: #bada55; padding: 5px;",
    );

    while (true) {
      let items = document.querySelectorAll(".itemIN");
      console.log(
        `%c \n--- পেজ নম্বর: ${pageCount} (মোট প্রোডাক্ট: ${items.length}) ---`,
        "background: #f39c12; color: white; padding: 2px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");

        if (linkEl) {
          let productUrl = linkEl.href;
          let title = linkEl.innerText.trim().split("\n").pop().trim();
          let price =
            item.querySelector("h5")?.childNodes[0].textContent.trim() || "N/A";
          let ref = item.querySelector("h3 b")?.innerText.trim() || "N/A";

          // ডিটেইলস নিয়ে আসা
          let details = await getProductDetails(productUrl, title);

          allProducts.push({
            Title: title,
            Reference: ref,
            Price: price,
            Sizes: details.sizes,
            Description: details.desc,
            Images: details.allImages,
            URL: productUrl,
          });

          // সাইটকে রেস্ট দেয়া
          await new Promise((r) => setTimeout(r, 1000));
        }
      }

      // পরবর্তী পেজ খোঁজা
      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        console.log(
          `%c পেজ ${pageCount} শেষ। পরবর্তী পেজে যাচ্ছি...`,
          "color: #9b59b6;",
        );
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000)); // AJAX লোডের জন্য অপেক্ষা
      } else {
        console.log(
          "%c আর কোনো পেজ নেই। ডাটা ডাউনলোড হচ্ছে...",
          "color: #27ae60; font-weight: bold;",
        );
        break;
      }
    }

    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    let csvContent = "\uFEFF" + headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kangroute_all_data_${allProducts.length}.csv`;
    link.click();
    console.log(`মোট ${allProducts.length} টি প্রোডাক্টের ডাটা ডাউনলোড হয়েছে।`);
  }

  start();
})();

// একটি প্রোডাক্টের প্রথম সারিতে (Row) সব তথ্য (Title, Price, Size, Description, Image 1) থাকবে, কিন্তু ঐ একই প্রোডাক্টের পরবর্তী ছবিগুলোর জন্য যে সারিগুলো তৈরি হবে, সেগুলোতে শুধুমাত্র Title এবং Image URL থাকবে—বাকি ঘরগুলো (Price, Size, Desc) ফাঁকা থাকবে।
(async function () {
  let allProducts = [];
  let pageCount = 1;

  async function getProductDetails(url, productName) {
    try {
      console.log(
        `%c >> প্রবেশ করছি: ${productName}`,
        "color: #3498db; font-weight: bold;",
      );

      let response = await fetch(url);
      let text = await response.text();
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ইমেজ খোঁজা (Multiple Images)
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];

      if (uniqueImages.length === 0) {
        let mainImg = doc.querySelector("#my_image")?.src;
        if (mainImg) uniqueImages.push(mainImg);
      }
      console.log(`   - ছবি পাওয়া গেছে: ${uniqueImages.length} টি`);

      // সাইজ খোঁজা
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ডেসক্রিপশন
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => li.innerText.trim())
        .join("; ");
      let fullDescription = (intro + " Features: " + features).trim();

      return {
        images: uniqueImages,
        sizes: sizeOptions.join(", "),
        desc: fullDescription,
      };
    } catch (err) {
      console.error(`   !! ${productName} এর তথ্য নিতে সমস্যা হয়েছে।`);
      return { images: [], sizes: "N/A", desc: "N/A" };
    }
  }

  async function start() {
    console.log(
      "%c স্ক্র্যাপার চালু হয়েছে... ১ম সারিতে সব তথ্য, পরের সারিতে শুধু টাইটেল ও ইমেজ।",
      "background: #222; color: #bada55; padding: 5px;",
    );

    while (true) {
      let items = document.querySelectorAll(".itemIN");
      console.log(
        `%c \n--- পেজ নম্বর: ${pageCount} (প্রোডাক্ট আছে: ${items.length}) ---`,
        "background: #f39c12; color: white; padding: 2px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");

        if (linkEl) {
          let productUrl = linkEl.href;
          let title = linkEl.innerText.trim().split("\n").pop().trim();
          let price =
            item.querySelector("h5")?.childNodes[0].textContent.trim() || "N/A";
          let ref = item.querySelector("h3 b")?.innerText.trim() || "N/A";

          let details = await getProductDetails(productUrl, title);

          if (details.images.length > 0) {
            details.images.forEach((imgUrl, index) => {
              if (index === 0) {
                // প্রথম সারিতে সব তথ্য থাকবে
                allProducts.push({
                  Title: title,
                  Reference: ref,
                  Price: price,
                  Size: details.sizes,
                  Description: details.desc,
                  "Image URL": imgUrl,
                  "Product URL": productUrl,
                });
              } else {
                // পরের সারিগুলোতে শুধু টাইটেল এবং ইমেজ থাকবে, বাকি সব ফাঁকা ("")
                allProducts.push({
                  Title: title,
                  Reference: "",
                  Price: "",
                  Size: "",
                  Description: "",
                  "Image URL": imgUrl,
                  "Product URL": "",
                });
              }
            });
          } else {
            // ইমেজ না থাকলে একটি পূর্ণ রো
            allProducts.push({
              Title: title,
              Reference: ref,
              Price: price,
              Size: details.sizes,
              Description: details.desc,
              "Image URL": "N/A",
              "Product URL": productUrl,
            });
          }
          await new Promise((r) => setTimeout(r, 800));
        }
      }

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    let csvContent = "\uFEFF" + headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kangroute_clean_rows.csv`;
    link.click();
  }

  start();
})();

// 1` test korbe
(async function () {
  console.log(
    "%c ১টি প্রোডাক্ট টেস্ট রান শুরু হচ্ছে...",
    "color: #e67e22; font-weight: bold; font-size: 14px;",
  );

  async function getProductDetails(url, productName) {
    try {
      console.log(`%c >> পেজে ঢুকছি: ${productName}`, "color: #3498db;");
      let response = await fetch(url);
      let text = await response.text();
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ইমেজ সংগ্রহ
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];

      if (uniqueImages.length === 0) {
        let mainImg = doc.querySelector("#my_image")?.src;
        if (mainImg) uniqueImages.push(mainImg);
      }

      // সাইজ সংগ্রহ
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ডেসক্রিপশন
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => li.innerText.trim())
        .join("; ");
      let fullDescription = (intro + " Features: " + features).trim();

      return {
        images: uniqueImages,
        sizes: sizeOptions.join(", "),
        desc: fullDescription,
      };
    } catch (err) {
      console.error("Error:", err);
      return null;
    }
  }

  // শুধুমাত্র প্রথম প্রোডাক্টটি ধরবে
  let firstItem = document.querySelector(".itemIN");
  if (!firstItem)
    return console.error(
      "প্রোডাক্ট পাওয়া যায়নি! দয়া করে ক্যাটাগরি পেজে গিয়ে রান করুন।",
    );

  let linkEl = firstItem.querySelector("h3 a");
  let title = linkEl.innerText.trim().split("\n").pop().trim();
  let price =
    firstItem.querySelector("h5")?.childNodes[0].textContent.trim() || "N/A";
  let ref = firstItem.querySelector("h3 b")?.innerText.trim() || "N/A";
  let testData = [];

  let details = await getProductDetails(linkEl.href, title);

  if (details) {
    details.images.forEach((imgUrl, index) => {
      testData.push({
        Title: title,
        Reference: index === 0 ? ref : "",
        Price: index === 0 ? price : "",
        Size: index === 0 ? details.sizes : "",
        Description: index === 0 ? details.desc : "",
        "Image URL": imgUrl,
      });
    });

    // রেজাল্ট টেবিলে দেখানো
    console.log(
      "%c টেস্ট রেজাল্ট নিচে দেখুন:",
      "color: #27ae60; font-weight: bold;",
    );
    console.table(testData);
    console.log(
      "%c যদি উপরের টেবিলটি ঠিক থাকে, তবে আপনি আগের পুরো কোডটি রান করতে পারেন।",
      "color: #8e44ad;",
    );
  }
})();

// কেন এই কোডটি সেরা?
// UTF-8 BOM: \uFEFF ব্যবহারের কারণে ওই স্পেশাল ড্যাশ (–) বা ফ্রেঞ্চ/স্প্যানিশ ক্যারেক্টারগুলো এক্সেলে বা শপিফাইতে একদম নিখুঁত দেখাবে।

// Shopify Logic: প্রতিটি ইমেজের জন্য আলাদা রো তৈরি করা হয়েছে এবং হ্যান্ডেল (Handle) দিয়ে সেগুলোকে যুক্ত রাখা হয়েছে।

// HTML Body: ডেসক্রিপশন সরাসরি HTML কোড হিসেবে আসবে, ফলে শপিফাইতে আপলোড করার পর আপনার প্রোডাক্ট ডেসক্রিপশন অটোমেটিক সুন্দর ফরমেটে (Bullets/Paragraph) সাজানো থাকবে।

// Auto Navigation: এটি আপনার হয়ে প্রতিটি পেজে যাবে এবং ডাটা নিয়ে আসবে। আপনাকে শুধু কনসোলটা ওপেন রাখতে হবে।

// কিভাবে রান করবেন: ১. আপনার ব্রাউজার কনসোলে পুরো কোডটি পেস্ট করে এন্টার দিন। ২. কাজ শেষ হলে (সব ১৩টি পেজ) ফাইলটি অটোমেটিক ডাউনলোড হয়ে যাবে।
(async function () {
  let allProducts = [];
  let pageCount = 1;

  console.log(
    "%c [START] শপিফাই ফুল স্ক্র্যাপার চালু হচ্ছে...",
    "background: #2ecc71; color: white; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(url, productName) {
    try {
      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);

      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ১. ইমেজ সংগ্রহ
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];
      if (uniqueImages.length === 0)
        uniqueImages.push(doc.querySelector("#my_image")?.src || "");

      // ২. সাইজ সংগ্রহ
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ৩. ডেসক্রিপশন (HTML ফরম্যাটে)
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<p>${intro}</p><ul>${features}</ul>`;

      // ৪. SKU সংগ্রহ (REF কোড থেকে)
      let sku =
        doc.querySelector("h4 b")?.innerText.trim() ||
        doc.querySelector("h4")?.innerText.replace("REF:", "").trim() ||
        "N/A";

      return {
        images: uniqueImages,
        sizes: sizeOptions.join(", "),
        bodyHTML,
        sku,
      };
    } catch (err) {
      console.error(`   !! ${productName} ডাটা নিতে ব্যর্থ।`);
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      console.log(
        `%c \n--- পেজ: ${pageCount} (প্রোডাক্ট সংখ্যা: ${items.length}) ---`,
        "background: #34495e; color: white; padding: 2px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");

        if (linkEl) {
          let productUrl = linkEl.href;
          let titleParts = linkEl.innerText.trim().split("\n");
          let cleanTitle = titleParts[titleParts.length - 1].trim();
          let price =
            item.querySelector("h5")?.childNodes[0].textContent.trim() || "N/A";
          let handle = cleanTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          console.log(`%c সংগ্রহ করছি: ${cleanTitle}`, "color: #3498db;");

          let details = await getProductDetails(productUrl, cleanTitle);

          if (details) {
            details.images.forEach((imgUrl, index) => {
              allProducts.push({
                Handle: handle,
                Title: index === 0 ? cleanTitle : "",
                Vendor: "Goyamoto",
                Type: "Motorcycle Gear",
                SKU: index === 0 ? details.sku : "",
                Barcode: "", // বারকোড নেই তাই ফাঁকা
                Price: index === 0 ? price : "",
                "Option1 Name": index === 0 ? "Size" : "",
                "Option1 Value": index === 0 ? details.sizes : "",
                "Body (HTML)": index === 0 ? details.bodyHTML : "",
                "Image Src": imgUrl,
                "Image Position": index + 1,
              });
            });
          }
          // ছোট বিরতি যাতে সাইট ব্লক না করে
          await new Promise((r) => setTimeout(r, 700));
        }
      }

      // পরবর্তী পেজে যাওয়ার লজিক
      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        console.log(
          "%c পরবর্তী পেজে যাচ্ছি...",
          "color: #9b59b6; font-weight: bold;",
        );
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000)); // AJAX লোডের জন্য সময় দিন
      } else {
        console.log(
          "%c আর কোনো পেজ নেই। ফাইল তৈরি হচ্ছে...",
          "color: #27ae60; font-weight: bold;",
        );
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return console.log("কোনো ডাটা পাওয়া যায়নি।");

    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    // UTF-8 BOM যুক্ত করা হয়েছে যাতে স্পেশাল ক্যারেক্টার (–) ঠিক থাকে
    let csvContent = "\uFEFF" + headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_ready_data_${allProducts.length}.csv`;
    link.click();

    console.log(
      `%c [SUCCESS] মোট ${allProducts.length} টি সারি ডাউনলোড হয়েছে।`,
      "color: #2ecc71; font-weight: bold; font-size: 14px;",
    );
  }

  start();
})();

//ডেটা সংগ্রহের গতি বাড়ানোর জন্য আমরা Parallel Processing (সমান্তরাল প্রসেসিং) ব্যবহার করতে পারি। বর্তমানে কোডটি একটি প্রোডাক্টের কাজ শেষ করে তারপর অন্যটিতে যায়। কিন্তু আমরা যদি একসাথে ৫-১০টি প্রোডাক্টের রিকোয়েস্ট পাঠাই, তবে সময় অনেক কমে আসবে। তবে মনে রাখবেন, খুব বেশি ফাস্ট করলে ওয়েবসাইট আপনাকে "Bot" ভেবে ব্লক করে দিতে পারে। আমি একটি ব্যালেন্সড Fast Version দিচ্ছি যা একই সাথে ৫টি প্রোডাক্টের ডাটা প্রসেস করবে।
(async function () {
  let allProducts = [];
  let pageCount = 1;
  const CONCURRENCY_LIMIT = 5; // একসাথে ৫টি প্রোডাক্টের ডাটা নেবে

  console.log(
    "%c [FAST MODE] স্ক্র্যাপার চালু হচ্ছে...",
    "background: #e67e22; color: white; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(url, productName) {
    try {
      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];
      if (uniqueImages.length === 0)
        uniqueImages.push(doc.querySelector("#my_image")?.src || "");

      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<p>${intro}</p><ul>${features}</ul>`;
      let sku =
        doc.querySelector("h4 b")?.innerText.trim() ||
        doc.querySelector("h4")?.innerText.replace("REF:", "").trim() ||
        "N/A";

      return {
        images: uniqueImages,
        sizes: sizeOptions.join(", "),
        bodyHTML,
        sku,
      };
    } catch (err) {
      return null;
    }
  }

  // চঙ্ক (Chunk) প্রসেসিং ফাংশন
  async function processInChunks(items) {
    for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
      const chunk = Array.from(items).slice(i, i + CONCURRENCY_LIMIT);
      console.log(
        `Processing batch: ${i + 1} to ${Math.min(i + CONCURRENCY_LIMIT, items.length)}`,
      );

      const promises = chunk.map((item) => {
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) return null;

        let productUrl = linkEl.href;
        let titleParts = linkEl.innerText.trim().split("\n");
        let cleanTitle = titleParts[titleParts.length - 1].trim();
        let price =
          item.querySelector("h5")?.childNodes[0].textContent.trim() || "N/A";
        let handle = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        return getProductDetails(productUrl, cleanTitle).then((details) => {
          if (details) {
            details.images.forEach((imgUrl, index) => {
              allProducts.push({
                Handle: handle,
                Title: index === 0 ? cleanTitle : "",
                Vendor: "Goyamoto",
                Type: "Motorcycle Gear",
                SKU: index === 0 ? details.sku : "",
                Barcode: "",
                Price: index === 0 ? price : "",
                "Option1 Name": index === 0 ? "Size" : "",
                "Option1 Value": index === 0 ? details.sizes : "",
                "Body (HTML)": index === 0 ? details.bodyHTML : "",
                "Image Src": imgUrl,
                "Image Position": index + 1,
              });
            });
          }
        });
      });

      await Promise.all(promises);
      await new Promise((r) => setTimeout(r, 500)); // ব্যাচের মাঝে সামান্য গ্যাপ
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      console.log(
        `%c \n--- পেজ: ${pageCount} ---`,
        "background: #34495e; color: white; padding: 2px 10px;",
      );
      await processInChunks(items);

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 5000));
      } else {
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    let csvContent = "\uFEFF" + headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_fast_data_${allProducts.length}.csv`;
    link.click();
    console.log("ডাউনলোড সম্পন্ন!");
  }

  start();
})();

// Shopify Final Optimized Fast Scraper (JS)
(async function () {
  let allProducts = [];
  let pageCount = 1;
  const CONCURRENCY_LIMIT = 8; // একসাথে ৮টি প্রোডাক্টের ডাটা প্রসেস করবে (গতি বাড়ানোর জন্য)

  console.log(
    "%c [JS FAST MODE] স্ক্র্যাপার চালু হয়েছে... সময় সাশ্রয় হবে।",
    "background: #27ae60; color: white; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(url, productName) {
    try {
      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ইমেজ কালেকশন
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];
      if (uniqueImages.length === 0)
        uniqueImages.push(doc.querySelector("#my_image")?.src || "");

      // সাইজ কালেকশন
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ডেসক্রিপশন (HTML Format)
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<p>${intro}</p><ul>${features}</ul>`;

      // SKU কালেকশন
      let sku =
        doc.querySelector("h4 b")?.innerText.trim() ||
        doc.querySelector("h4")?.innerText.replace("REF:", "").trim() ||
        "N/A";

      return {
        images: uniqueImages,
        sizes: sizeOptions.join(", "),
        bodyHTML,
        sku,
      };
    } catch (err) {
      console.warn(`!! ${productName} লোড করতে সমস্যা হয়েছে।`);
      return null;
    }
  }

  async function processPageItems(items) {
    let itemsArray = Array.from(items);
    for (let i = 0; i < itemsArray.length; i += CONCURRENCY_LIMIT) {
      let chunk = itemsArray.slice(i, i + CONCURRENCY_LIMIT);
      console.log(
        `%c ব্যাচ প্রসেস হচ্ছে: ${i + 1} থেকে ${Math.min(i + CONCURRENCY_LIMIT, itemsArray.length)}`,
        "color: #f39c12;",
      );

      await Promise.all(
        chunk.map(async (item) => {
          let linkEl = item.querySelector("h3 a");
          if (!linkEl) return;

          let productUrl = linkEl.href;
          let titleParts = linkEl.innerText.trim().split("\n");
          let cleanTitle = titleParts[titleParts.length - 1].trim();
          let price =
            item.querySelector("h5")?.childNodes[0].textContent.trim() || "N/A";
          let handle = cleanTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          let details = await getProductDetails(productUrl, cleanTitle);
          if (details) {
            details.images.forEach((imgUrl, index) => {
              allProducts.push({
                Handle: handle,
                Title: index === 0 ? cleanTitle : "",
                Vendor: "Goyamoto",
                Type: "Motorcycle Gear",
                SKU: index === 0 ? details.sku : "",
                Barcode: "",
                Price: index === 0 ? price : "",
                "Option1 Name": index === 0 ? "Size" : "",
                "Option1 Value": index === 0 ? details.sizes : "",
                "Body (HTML)": index === 0 ? details.bodyHTML : "",
                "Image Src": imgUrl,
                "Image Position": index + 1,
              });
            });
          }
        }),
      );
      // ব্যাচের মাঝে সামান্য বিরতি যাতে ব্রাউজার রেসপন্স করতে পারে
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      console.log(
        `%c \n--- পেজ: ${pageCount} (প্রোডাক্ট লোড হচ্ছে) ---`,
        "background: #2980b9; color: white; padding: 2px 10px;",
      );
      await processPageItems(items);

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        console.log(
          "%c পরবর্তী পেজে যাচ্ছি...",
          "color: #8e44ad; font-weight: bold;",
        );
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 5500)); // পেজ লোড হওয়ার জন্য সময়
      } else {
        console.log(
          "%c সব পেজ শেষ। ডাটা ডাউনলোড হচ্ছে...",
          "color: #27ae60; font-weight: bold;",
        );
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    let headers = Object.keys(allProducts[0]).join(",");
    let rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    let csvContent = "\uFEFF" + headers + "\n" + rows;
    let blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_final_data_${allProducts.length}.csv`;
    link.click();
    console.log(
      `%c সাফল্য! মোট ${allProducts.length} টি সারি সংগ্রহ করা হয়েছে।`,
      "color: #2ecc71; font-weight: bold; font-size: 16px;",
    );
  }

  start();
})();

// Final Optimized Scraper (Zero Character Loss & Fast)

(async function () {
  let allProducts = [];
  let pageCount = 1;
  const CONCURRENCY_LIMIT = 6; // নিরাপদ গতি

  console.log(
    "%c [SYSTEM] High-Fidelity Scraper Active (Special Characters Enabled)",
    "background: #111; color: #00ff00; padding: 5px;",
  );

  async function getProductDetails(url, productName) {
    try {
      let response = await fetch(url);
      if (!response.ok) throw new Error("Network Error");

      // স্পেশাল ক্যারেক্টার সংরক্ষণের জন্য বাইনারি ডাটা থেকে ডিকোড করা
      let buffer = await response.arrayBuffer();
      let decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);

      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ১. ইমেজ সংগ্রহ
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements)
        .map((img) => img.src.replace("/mobile", "/"))
        .filter((src) => src.includes("/uploads/"));

      let uniqueImages = [...new Set(imageList)];
      if (uniqueImages.length === 0) {
        let mainImg = doc.querySelector("#my_image")?.src;
        if (mainImg) uniqueImages.push(mainImg);
      }

      // ২. সাইজ সংগ্রহ
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ৩. ডেসক্রিপশন (সব ক্যারেক্টারসহ HTML)
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<div><p>${intro}</p><ul>${features}</ul></div>`;

      // ৪. SKU
      let sku =
        doc.querySelector("h4 b")?.innerText.trim() ||
        doc.querySelector("h4")?.innerText.replace("REF:", "").trim() ||
        "N/A";

      return {
        images: uniqueImages,
        sizes: sizeOptions.join(", "),
        bodyHTML,
        sku,
      };
    } catch (err) {
      console.error(`%c [SKIP] ${productName}`, "color: red;");
      return null;
    }
  }

  async function processBatch(items) {
    for (let i = 0; i < items.length; i += CONCURRENCY_LIMIT) {
      let chunk = Array.from(items).slice(i, i + CONCURRENCY_LIMIT);

      await Promise.all(
        chunk.map(async (item) => {
          let linkEl = item.querySelector("h3 a");
          if (!linkEl) return;

          let productUrl = linkEl.href;
          let titleParts = linkEl.innerText.trim().split("\n");
          let cleanTitle = titleParts[titleParts.length - 1].trim();
          let price =
            item.querySelector("h5")?.childNodes[0].textContent.trim() || "N/A";

          // শপিফাই হ্যান্ডেল (স্পেশাল ক্যারেক্টার মুক্ত ইউআরএল এর জন্য)
          let handle = cleanTitle
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // é -> e
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

          let details = await getProductDetails(productUrl, cleanTitle);

          if (details && details.images.length > 0) {
            details.images.forEach((imgUrl, index) => {
              allProducts.push({
                Handle: handle,
                Title: index === 0 ? cleanTitle : "",
                Vendor: "Goyamoto",
                Type: "Motorcycle Gear",
                SKU: index === 0 ? details.sku : "",
                Price: index === 0 ? price : "",
                "Option1 Name": index === 0 ? "Size" : "",
                "Option1 Value": index === 0 ? details.sizes : "",
                "Body (HTML)": index === 0 ? details.bodyHTML : "",
                "Image Src": imgUrl,
                "Image Position": index + 1,
                Published: "TRUE",
              });
            });
            console.log(`%c [SAVED] ${cleanTitle}`, "color: #3498db;");
          }
        }),
      );
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      console.log(
        `%c \n--- Processing Page ${pageCount} ---`,
        "background: #222; color: #fff; padding: 2px 5px;",
      );
      await processBatch(items);

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;

    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${v.toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    // UTF-8 BOM (\uFEFF) নিশ্চিত করে যে এক্সেল স্পেশাল ক্যারেক্টার চিনতে পারবে
    const csvContent = "\uFEFF" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kangroute_shopify_full_data.csv`;
    link.click();
    console.log(
      "%c [DONE] ফাইল ডাউনলোড হয়েছে।",
      "color: #27ae60; font-weight: bold;",
    );
  }

  start();
})();

//১টি করে প্রোডাক্ট প্রসেস করার ফাইনাল স্ক্র্যাপার
(async function () {
  let allProducts = [];
  let pageCount = 1;

  console.log(
    "%c [SYSTEM] ১টি করে প্রোডাক্ট প্রসেসিং মোড চালু হয়েছে। ",
    "background: #2ecc71; color: white; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(url, productName) {
    try {
      console.log(
        `%c >> বর্তমান প্রোডাক্ট: ${productName}`,
        "color: #3498db; font-weight: bold;",
      );

      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ইমেজ সংগ্রহ
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];
      if (uniqueImages.length === 0)
        uniqueImages.push(doc.querySelector("#my_image")?.src || "");

      // সাইজ সংগ্রহ
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ডেসক্রিপশন (HTML)
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<div><p>${intro}</p><ul>${features}</ul></div>`;

      // SKU
      let sku =
        doc.querySelector("h4 b")?.innerText.trim() ||
        doc.querySelector("h4")?.innerText.replace("REF:", "").trim() ||
        "N/A";

      console.log(
        `   - ছবি: ${uniqueImages.length} টি | সাইজ: ${sizeOptions.length} টি`,
      );
      return { images: uniqueImages, sizes: sizeOptions, bodyHTML, sku };
    } catch (err) {
      console.error(
        `%c !! ${productName} লোড করতে সমস্যা হয়েছে।`,
        "color: red;",
      );
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      console.log(
        `%c \n--- পেজ নম্বর: ${pageCount} শুরু হচ্ছে ---`,
        "background: #34495e; color: white; padding: 5px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let titleParts = linkEl.innerText.trim().split("\n");
        let cleanTitle = titleParts[titleParts.length - 1].trim();
        let price =
          item.querySelector("h5")?.childNodes[0].textContent.trim() || "N/A";
        let handle = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        // ১টি ১টি করে প্রোডাক্টের ভেতর ঢুকবে
        let details = await getProductDetails(linkEl.href, cleanTitle);

        if (details) {
          // সাইজ ভেরিয়েন্ট সারি তৈরি
          details.sizes.forEach((size, sIndex) => {
            allProducts.push({
              Handle: handle,
              Title: sIndex === 0 ? cleanTitle : "",
              Vendor: "Goyamoto",
              SKU: details.sku + "-" + (sIndex + 1),
              Price: price,
              "Option1 Name": "Size",
              "Option1 Value": size,
              "Body (HTML)": sIndex === 0 ? details.bodyHTML : "",
              "Image Src":
                sIndex < details.images.length ? details.images[sIndex] : "",
              "Image Position":
                sIndex < details.images.length ? sIndex + 1 : "",
              Published: "TRUE",
            });
          });

          // অতিরিক্ত ছবি যোগ করা
          if (details.images.length > details.sizes.length) {
            for (
              let imgIdx = details.sizes.length;
              imgIdx < details.images.length;
              imgIdx++
            ) {
              allProducts.push({
                Handle: handle,
                Title: "",
                Vendor: "",
                SKU: "",
                Price: "",
                "Option1 Name": "",
                "Option1 Value": "",
                "Body (HTML)": "",
                "Image Src": details.images[imgIdx],
                "Image Position": imgIdx + 1,
                Published: "TRUE",
              });
            }
          }

          // প্রোডাক্ট সেপারেশন (ফাঁকা রো)
          allProducts.push({
            Handle: "",
            Title: "--- " + cleanTitle + " শেষ ---",
          });
        }

        // ১টি প্রোডাক্ট শেষ হওয়ার পর সামান্য বিরতি (০.৫ সেকেন্ড)
        await new Promise((r) => setTimeout(r, 500));
      }

      // পরবর্তী পেজ লজিক
      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        console.log(
          `%c পেজ ${pageCount} সম্পন্ন। ৬ সেকেন্ড পর পরের পেজে যাচ্ছি...`,
          "color: #9b59b6;",
        );
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        console.log(
          "%c সব পেজ শেষ! ডাটা প্রসেস হচ্ছে...",
          "color: #27ae60; font-weight: bold;",
        );
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csvContent = "\uFEFF" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kangroute_final_one_by_one.csv`;
    link.click();
    console.log(
      `%c কাজ সফলভাবে শেষ হয়েছে। ফাইল চেক করুন।`,
      "color: #2ecc71; font-weight: bold; font-size: 16px;",
    );
  }

  start();
})();

// আপনার দেওয়া এক্সাম্পল ফরম্যাট অনুযায়ী আমি কোডটি আপডেট করে দিচ্ছি। শপিফাই ইমপোর্টের জন্য যে কলামগুলো প্রয়োজন (যেমন: Handle, Title, Body (HTML), Option1 Name, Option1 Value, Variant Inventory Qty, Variant Price, ইত্যাদি) সব এখানে সেট করে দেওয়া হয়েছে। এই কোডটি ১টি ১টি করে প্রোডাক্ট প্রসেস করবে এবং শপিফাইয়ের স্ট্যান্ডার্ড কলামগুলো মেনটেইন করবে। শপিফাই স্ট্যান্ডার্ড CSV ফরম্যাট স্ক্র্যাপার

(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let pageCount = 1;

  console.log(
    "%c [SYSTEM] শপিফাই ফরম্যাট স্ক্র্যাপার চালু হয়েছে... ",
    "background: #2ecc71; color: white; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(url, productName) {
    try {
      console.log(
        `%c >> বর্তমান প্রোডাক্ট: ${productName}`,
        "color: #3498db; font-weight: bold;",
      );

      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ইমেজ সংগ্রহ
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];
      if (uniqueImages.length === 0)
        uniqueImages.push(doc.querySelector("#my_image")?.src || "");

      // সাইজ সংগ্রহ
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ডেসক্রিপশন
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<div><p>${intro}</p><ul>${features}</ul></div>`;

      // SKU
      let sku =
        doc.querySelector("h4 b")?.innerText.trim() ||
        doc.querySelector("h4")?.innerText.replace("REF:", "").trim() ||
        "N/A";

      let descStatus =
        intro || features
          ? "১টি Description পাওয়া গেছে"
          : "Description পাওয়া যায়নি";
      console.log(
        `   - ছবি: ${uniqueImages.length} টি | সাইজ: ${sizeOptions.length} টি | ${descStatus}`,
      );

      return { images: uniqueImages, sizes: sizeOptions, bodyHTML, sku };
    } catch (err) {
      console.error(
        `%c !! ${productName} লোড করতে সমস্যা হয়েছে।`,
        "color: red;",
      );
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      console.log(
        `%c \n--- পেজ নম্বর: ${pageCount} ---`,
        "background: #34495e; color: white; padding: 5px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let titleParts = linkEl.innerText.trim().split("\n");
        let cleanTitle = titleParts[titleParts.length - 1].trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .trim() || "0";
        let handle = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        let details = await getProductDetails(linkEl.href, cleanTitle);

        if (details) {
          uniqueProductCount++;

          // ভেরিয়েন্ট এবং ইমেজ রো তৈরি
          let maxLength = Math.max(details.sizes.length, details.images.length);

          for (let j = 0; j < maxLength; j++) {
            let isFirstRow = j === 0;
            let size = details.sizes[j] || "";
            let imgSrc = details.images[j] || "";

            allProducts.push({
              Handle: handle,
              Title: isFirstRow ? cleanTitle : "",
              "Body (HTML)": isFirstRow ? details.bodyHTML : "",
              Tags: "Motorcycle, Goyamoto",
              "Option1 Name": isFirstRow ? "Size" : size ? "Size" : "",
              "Option1 Value": size,
              "Variant Grams": "0",
              "Variant Inventory Tracker": "shopify",
              "Variant Inventory Qty": "100",
              "Variant Inventory Policy": "deny",
              "Variant Fulfillment Service": "manual",
              "Image src": imgSrc,
              "Image Position": imgSrc ? j + 1 : "",
              "Variant Price": isFirstRow || size ? price : "",
              "Variant Image": size && imgSrc ? imgSrc : "",
              Status: isFirstRow ? "active" : "",
            });
          }

          // প্রতিটি প্রোডাক্টের পর খালি রো (আপনার চাহিদা মতো)
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        await new Promise((r) => setTimeout(r, 600));
      }

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csvContent = "\uFEFF" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_final_format.csv`;
    link.click();

    console.log(
      `%c কাজ শেষ! মোট ${uniqueProductCount} টি প্রোডাক্ট সংগৃহীত।`,
      "color: #2ecc71; font-weight: bold; font-size: 16px; border: 2px solid #2ecc71; padding: 10px;",
    );
  }

  start();
})();

//Shopify Final Precise Scraper
(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let pageCount = 1;

  console.log(
    "%c [SYSTEM] SKU Optimized Scraper চালু হয়েছে... ",
    "background: #111; color: #00ff00; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(url, productName) {
    try {
      console.log(
        `%c >> বর্তমান প্রোডাক্ট: ${productName}`,
        "color: #3498db; font-weight: bold;",
      );

      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ইমেজ সংগ্রহ
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];
      if (uniqueImages.length === 0)
        uniqueImages.push(doc.querySelector("#my_image")?.src || "");

      // সাইজ সংগ্রহ
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ডেসক্রিপশন সংগ্রহ
      let intro = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<div><p>${intro}</p><ul>${features}</ul></div>`;

      // SKU লজিক: <b> ট্যাগের ভেতর থেকে সরাসরি টেক্সট নেওয়া
      let skuRef = "SKU-UNKNOWN";
      let skuElement = doc.querySelector("h4 b");
      if (skuElement) {
        skuRef = skuElement.innerText.trim();
      }

      console.log(
        `   - SKU: ${skuRef} | ছবি: ${uniqueImages.length} টি | সাইজ: ${sizeOptions.length} টি`,
      );
      return { images: uniqueImages, sizes: sizeOptions, bodyHTML, skuRef };
    } catch (err) {
      console.error(
        `%c !! ${productName} লোড করতে সমস্যা হয়েছে।`,
        "color: red;",
      );
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      console.log(
        `%c \n--- পেজ নম্বর: ${pageCount} ---`,
        "background: #34495e; color: white; padding: 5px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let titleParts = linkEl.innerText.trim().split("\n");
        let cleanTitle = titleParts[titleParts.length - 1].trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .replace(",", ".")
            .trim() || "0";
        let handle = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        let details = await getProductDetails(linkEl.href, cleanTitle);

        if (details) {
          uniqueProductCount++;
          let maxLength = Math.max(details.sizes.length, details.images.length);

          for (let j = 0; j < maxLength; j++) {
            let isFirstRow = j === 0;
            let size = details.sizes[j] || "";
            let imgSrc = details.images[j] || "";

            allProducts.push({
              Handle: handle,
              Title: isFirstRow ? cleanTitle : "",
              "Body (HTML)": isFirstRow ? details.bodyHTML : "",
              Vendor: isFirstRow ? "Kangroute" : "",
              "Product Category": "",
              Type: isFirstRow ? "Motorcycle Gear" : "",
              Tags: isFirstRow ? "Goyamoto, Motorcycle" : "",
              Published: "TRUE",
              "Option1 Name": isFirstRow || size ? "Size" : "",
              "Option1 Value": size,
              "Option1 Linked To": "",
              "Option2 Name": "",
              "Option2 Value": "",
              "Option2 Linked To": "",
              "Option3 Name": "",
              "Option3 Value": "",
              "Option3 Linked To": "",
              "Variant SKU": size
                ? `${details.skuRef}-${size.split(" ")[0]}`
                : isFirstRow
                  ? details.skuRef
                  : "",
              "Variant Grams": "0",
              "Variant Inventory Tracker": size || isFirstRow ? "shopify" : "",
              "Variant Inventory Qty": size || isFirstRow ? "100" : "",
              "Variant Inventory Policy": size || isFirstRow ? "deny" : "",
              "Variant Fulfillment Service": size || isFirstRow ? "manual" : "",
              "Variant Price": size || isFirstRow ? price : "",
              "Variant Compare At Price": "",
              "Variant Requires Shipping": "TRUE",
              "Variant Taxable": "TRUE",
              "Variant Barcode": "",
              "Image Src": imgSrc,
              "Image Position": imgSrc ? j + 1 : "",
              "Image Alt Text": isFirstRow ? cleanTitle : "",
              "Variant Image": size && imgSrc ? imgSrc : "",
              "Variant Weight Unit": "kg",
              "Variant Tax Code": "",
              "Cost per item": "",
              Status: isFirstRow ? "active" : "",
            });
          }
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        await new Promise((r) => setTimeout(r, 600));
      }

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csvContent = "\uFEFF" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_standard_import_sku_fixed.csv`;
    link.click();

    console.log(
      `%c কাজ শেষ! মোট ${uniqueProductCount} টি প্রোডাক্ট সংগৃহীত হয়েছে।`,
      "color: #2ecc71; font-weight: bold; font-size: 16px; border: 2px solid #2ecc71; padding: 10px;",
    );
  }

  start();
})();

// ফাইনাল ও নির্ভুল স্ক্র্যাপার (Description Fixed)
(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let pageCount = 1;

  console.log(
    "%c [SYSTEM] SKU & Description Fixed Scraper Active... ",
    "background: #111; color: #00ff00; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(url, productName) {
    try {
      console.log(
        `%c >> বর্তমান প্রোডাক্ট: ${productName}`,
        "color: #3498db; font-weight: bold;",
      );

      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let decoder = new TextDecoder("utf-8");
      let text = decoder.decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ইমেজ সংগ্রহ
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let imageList = Array.from(imgElements).map((img) =>
        img.src.replace("/mobile", "/"),
      );
      let uniqueImages = [...new Set(imageList)];
      if (uniqueImages.length === 0)
        uniqueImages.push(doc.querySelector("#my_image")?.src || "");

      // সাইজ সংগ্রহ
      let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ডেসক্রিপশন সংগ্রহ (Fixed Logic)
      let introText = doc.querySelector("h2")?.innerText.trim() || "";
      let featuresList = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");

      // এখানে ভেরিয়েবলগুলো `${}` দিয়ে ঠিক করা হয়েছে
      let bodyHTML = `<div><p>${introText}</p><ul>${featuresList}</ul></div>`;

      // SKU লজিক: h4 এর ভেতর যেখানে "REF:" আছে
      let skuRef = "SKU-UNKNOWN";
      let h4Elements = doc.querySelectorAll("h4");
      for (let h4 of h4Elements) {
        if (h4.innerText.includes("REF:")) {
          skuRef = h4.innerText.replace("REF:", "").trim();
          break;
        }
      }

      console.log(
        `   - SKU: ${skuRef} | ছবি: ${uniqueImages.length} টি | সাইজ: ${sizeOptions.length} টি | ১টি Description সংগৃহীত`,
      );
      return { images: uniqueImages, sizes: sizeOptions, bodyHTML, skuRef };
    } catch (err) {
      console.error(
        `%c !! ${productName} লোড করতে সমস্যা হয়েছে।`,
        "color: red;",
      );
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      console.log(
        `%c \n--- পেজ নম্বর: ${pageCount} ---`,
        "background: #34495e; color: white; padding: 5px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let titleParts = linkEl.innerText.trim().split("\n");
        let cleanTitle = titleParts[titleParts.length - 1].trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .replace(",", ".")
            .trim() || "0";
        let handle = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        let details = await getProductDetails(linkEl.href, cleanTitle);

        if (details) {
          uniqueProductCount++;
          let maxLength = Math.max(details.sizes.length, details.images.length);

          for (let j = 0; j < maxLength; j++) {
            let isFirstRow = j === 0;
            let size = details.sizes[j] || "";
            let imgSrc = details.images[j] || "";

            allProducts.push({
              Handle: handle,
              Title: isFirstRow ? cleanTitle : "",
              "Body (HTML)": isFirstRow ? details.bodyHTML : "",
              Vendor: isFirstRow ? "Kangroute" : "",
              "Product Category": "",
              Type: isFirstRow ? "Motorcycle Gear" : "",
              Tags: isFirstRow ? "Goyamoto, Motorcycle" : "",
              Published: "TRUE",
              "Option1 Name": isFirstRow || size ? "Size" : "",
              "Option1 Value": size,
              "Option1 Linked To": "",
              "Option2 Name": "",
              "Option2 Value": "",
              "Option2 Linked To": "",
              "Option3 Name": "",
              "Option3 Value": "",
              "Option3 Linked To": "",
              "Variant SKU": size
                ? `${details.skuRef}-${size.split(" ")[0]}`
                : isFirstRow
                  ? details.skuRef
                  : "",
              "Variant Grams": "0",
              "Variant Inventory Tracker": size || isFirstRow ? "shopify" : "",
              "Variant Inventory Qty": size || isFirstRow ? "100" : "",
              "Variant Inventory Policy": size || isFirstRow ? "deny" : "",
              "Variant Fulfillment Service": size || isFirstRow ? "manual" : "",
              "Variant Price": size || isFirstRow ? price : "",
              "Variant Compare At Price": "",
              "Variant Requires Shipping": "TRUE",
              "Variant Taxable": "TRUE",
              "Variant Barcode": "",
              "Image Src": imgSrc,
              "Image Position": imgSrc ? j + 1 : "",
              "Image Alt Text": isFirstRow ? cleanTitle : "",
              "Variant Image": size && imgSrc ? imgSrc : "",
              "Variant Weight Unit": "kg",
              "Variant Tax Code": "",
              "Cost per item": "",
              Status: isFirstRow ? "active" : "",
            });
          }
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        await new Promise((r) => setTimeout(r, 600));
      }

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csvContent = "\uFEFF" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_standard_import_fixed_description.csv`;
    link.click();

    console.log(
      `%c কাজ শেষ! আপনি মোট ${uniqueProductCount} টি প্রোডাক্ট সংগৃহীত করেছেন।`,
      "color: #2ecc71; font-weight: bold; font-size: 16px; border: 2px solid #2ecc71; padding: 10px;",
    );
  }

  start();
})();

//১. Header Highlighting: এখন কনসোলে প্রতিটি আইটেমের টাইটেল নীল রঙের ব্যাকগ্রাউন্ডে বড় করে আসবে। ২. Audit Sub-line: টাইটেলের ঠিক নিচেই সবুজ রঙে SKU, সাইজ এবং ছবির সংখ্যা দেখাবে। ৩. Shopify Alignment: CSV ফরম্যাটটি শপিফাই স্ট্যান্ডার্ড অনুযায়ী রাখা হয়েছে যাতে আপলোড করার সময় কোনো কলাম মিস না হয়।

(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let errorList = [];
  let pageCount = 1;

  console.log(
    "%c [SYSTEM] ডাটা সংগ্রহ শুরু হচ্ছে... প্রতিটি প্রোডাক্টের বিস্তারিত রিপোর্ট দেখানো হবে। ",
    "background: #111; color: #00ff00; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(
    url,
    productName,
    currentItem,
    totalItems,
    retries = 3,
  ) {
    for (let i = 0; i < retries; i++) {
      try {
        // প্রথমে প্রোডাক্টের নাম বড় করে দেখানো হচ্ছে
        console.log(
          `%c 📦 [${currentItem}/${totalItems}] PRODUCT: ${productName.toUpperCase()}`,
          "color: #ffffff; background: #2980b9; padding: 2px 5px; font-weight: bold;",
        );

        let response = await fetch(url);
        if (!response.ok)
          throw new Error(`Server Response: ${response.status}`);

        let buffer = await response.arrayBuffer();
        let decoder = new TextDecoder("utf-8");
        let text = decoder.decode(buffer);
        let parser = new DOMParser();
        let doc = parser.parseFromString(text, "text/html");

        // ইমেজ সংগ্রহ
        let imgElements = doc.querySelectorAll(
          "#itemimatges img, .jcarousel li img",
        );
        let imageList = Array.from(imgElements).map((img) =>
          img.src.replace("/mobile", "/"),
        );
        let uniqueImages = [...new Set(imageList)];
        if (uniqueImages.length === 0)
          uniqueImages.push(doc.querySelector("#my_image")?.src || "");

        // সাইজ সংগ্রহ
        let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
          .map((opt) => opt.innerText.trim())
          .filter(
            (s) =>
              s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
          );

        // ডেসক্রিপশন সংগ্রহ
        let introText = doc.querySelector("h2")?.innerText.trim() || "";
        let featuresList = Array.from(doc.querySelectorAll("#itemtxt ul li"))
          .map((li) => `<li>${li.innerText.trim()}</li>`)
          .join("");
        let bodyHTML = `<div><p>${introText}</p><ul>${featuresList}</ul></div>`;

        // SKU সংগ্রহ
        let skuRef = "SKU-UNKNOWN";
        let h4Elements = doc.querySelectorAll("h4");
        for (let h4 of h4Elements) {
          if (h4.innerText.includes("REF:")) {
            skuRef = h4.innerText.replace("REF:", "").trim();
            break;
          }
        }

        // আপনার অনুরোধ অনুযায়ী নিচে বাকি ইনফো
        console.log(
          `%c    🆔 SKU: ${skuRef} | 📏 Sizes: ${sizeOptions.length} | 🖼️ Images: ${uniqueImages.length} | 📝 Desc: ${bodyHTML.length > 50 ? "✅" : "❌"}`,
          "color: #27ae60; font-weight: bold;",
        );

        return { images: uniqueImages, sizes: sizeOptions, bodyHTML, skuRef };
      } catch (err) {
        if (i === retries - 1) {
          console.log(
            `%c    ❌ ব্যর্থ: ${productName} (Error: ${err.message})`,
            "background: red; color: white;",
          );
          errorList.push(productName);
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
    return null;
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      let totalItemsInPage = items.length;
      console.log(
        `%c \n--- 📄 পেজ: ${pageCount} (আইটেম সংখ্যা: ${totalItemsInPage}) ---`,
        "background: #000000; color: white; padding: 5px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let titleParts = linkEl.innerText.trim().split("\n");
        let cleanTitle = titleParts[titleParts.length - 1].trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .replace(",", ".")
            .trim() || "0";
        let handle = cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        let details = await getProductDetails(
          linkEl.href,
          cleanTitle,
          i + 1,
          totalItemsInPage,
        );

        if (details) {
          uniqueProductCount++;
          let totalRows = Math.max(
            details.sizes.length,
            details.images.length,
            1,
          );

          for (let j = 0; j < totalRows; j++) {
            let isFirstRow = j === 0;
            let size = details.sizes[j] || "";
            let imgSrc = details.images[j] || "";

            allProducts.push({
              Handle: handle,
              Title: isFirstRow ? cleanTitle : "",
              "Body (HTML)": isFirstRow ? details.bodyHTML : "",
              Vendor: isFirstRow ? "Kangroute" : "",
              Type: isFirstRow ? "Motorcycle Gear" : "",
              Tags: isFirstRow ? "Goyamoto, Motorcycle" : "",
              Published: "TRUE",
              "Option1 Name":
                (isFirstRow && details.sizes.length > 0) || size
                  ? "Size"
                  : isFirstRow
                    ? "Title"
                    : "",
              "Option1 Value":
                size ||
                (isFirstRow && details.sizes.length === 0
                  ? "Default Title"
                  : ""),
              "Variant SKU": size
                ? `${details.skuRef}-${size.split(" ")[0]}`
                : isFirstRow
                  ? details.skuRef
                  : "",
              "Variant Grams": "0",
              "Variant Inventory Tracker": size || isFirstRow ? "shopify" : "",
              "Variant Inventory Qty": size || isFirstRow ? "100" : "",
              "Variant Price": size || isFirstRow ? price : "",
              "Image Src": imgSrc,
              "Image Position": imgSrc ? j + 1 : "",
              "Image Alt Text": isFirstRow ? cleanTitle : "",
              "Variant Image":
                size && imgSrc ? imgSrc : isFirstRow && imgSrc ? imgSrc : "",
              Status: isFirstRow ? "active" : "",
            });
          }
          // স্পেসার রো
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        await new Promise((r) => setTimeout(r, 800));
      }

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        console.log(
          `%c পেজ ${pageCount} সম্পন্ন। পরবর্তী পেজে যাচ্ছি...`,
          "color: #9b59b6;",
        );
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csvContent = "\uFEFF" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kangroute_perfect_import.csv`;
    link.click();

    console.log(
      "%c সমাপ্ত! মোট সফল প্রোডাক্ট: " + uniqueProductCount,
      "color: #2ecc71; font-weight: bold; font-size: 16px;",
    );
  }

  start();
})();

//আপনার দেওয়া কোডটি বিশ্লেষণ করে আমি সবকটি দাবি (URL-ভিত্তিক Handle, Variant Barcode, এবং উন্নত Console Report) একত্র করে একটি মাস্টার স্ক্রিপ্ট তৈরি করেছি। এটি শপিফাই ইম্পোর্টের জন্য একদম নিখুঁত হবে।

(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let errorList = [];
  let pageCount = 1;

  console.log(
    "%c [SYSTEM] ডাটা সংগ্রহ শুরু হচ্ছে... প্রতিটি প্রোডাক্টের অডিট রিপোর্ট দেখানো হবে। ",
    "background: #111; color: #00ff00; padding: 5px; font-weight: bold;",
  );

  async function getProductDetails(
    url,
    productName,
    currentItem,
    totalItems,
    retries = 3,
  ) {
    // URL থেকে আইডি এবং স্লাগ নিয়ে হ্যান্ডেল তৈরি
    let urlParts = url.split("/");
    let handleFromUrl =
      urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
    let productId = handleFromUrl.split("-")[0]; // বারকোড তৈরির জন্য আইডি

    for (let i = 0; i < retries; i++) {
      try {
        // ১. প্রথমে বড় করে প্রোডাক্ট টাইটেল
        console.log(
          `%c 📦 [${currentItem}/${totalItems}] PRODUCT: ${productName.toUpperCase()}`,
          "color: #ffffff; background: #2980b9; padding: 2px 5px; font-weight: bold;",
        );

        let response = await fetch(url);
        if (!response.ok)
          throw new Error(`Server Response: ${response.status}`);

        let buffer = await response.arrayBuffer();
        let decoder = new TextDecoder("utf-8");
        let text = decoder.decode(buffer);
        let parser = new DOMParser();
        let doc = parser.parseFromString(text, "text/html");

        // ইমেজ সংগ্রহ
        let imgElements = doc.querySelectorAll(
          "#itemimatges img, .jcarousel li img",
        );
        let imageList = Array.from(imgElements).map((img) =>
          img.src.replace("/mobile", "/"),
        );
        let uniqueImages = [...new Set(imageList)];
        if (uniqueImages.length === 0)
          uniqueImages.push(doc.querySelector("#my_image")?.src || "");

        // সাইজ সংগ্রহ
        let sizeOptions = Array.from(doc.querySelectorAll("#boxsiz0 option"))
          .map((opt) => opt.innerText.trim())
          .filter(
            (s) =>
              s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
          );

        // ডেসক্রিপশন সংগ্রহ
        let introText = doc.querySelector("h2")?.innerText.trim() || "";
        let featuresList = Array.from(doc.querySelectorAll("#itemtxt ul li"))
          .map((li) => `<li>${li.innerText.trim()}</li>`)
          .join("");
        let bodyHTML = `<div><p>${introText}</p><ul>${featuresList}</ul></div>`;

        // SKU সংগ্রহ
        let skuRef = "SKU-UNKNOWN";
        let h4Elements = doc.querySelectorAll("h4");
        for (let h4 of h4Elements) {
          if (h4.innerText.includes("REF:")) {
            skuRef = h4.innerText.replace("REF:", "").trim();
            break;
          }
        }

        // বারকোড জেনারেশন (স্যাম্পল দেখার জন্য)
        let sampleBarcode = `888${productId}00`;

        // ২. SKU, Barcode এবং Image এক লাইনে অডিট
        console.log(
          `%c    🆔 SKU: ${skuRef} | 📊 Barcode: ${sampleBarcode} | 🖼️ Images: ${uniqueImages.length}`,
          "color: #27ae60; font-weight: bold;",
        );

        // ৩. ডেসক্রিপশন স্ট্যাটাস তার নিচে
        console.log(
          `%c    📝 Desc: ${bodyHTML.length > 50 ? "✅ সংগৃহীত" : "❌ পাওয়া যায়নি"}`,
          "color: #e67e22;",
        );

        return {
          images: uniqueImages,
          sizes: sizeOptions,
          bodyHTML,
          skuRef,
          handleFromUrl,
          productId,
        };
      } catch (err) {
        if (i === retries - 1) {
          console.log(
            `%c    ❌ ব্যর্থ: ${productName} (Error: ${err.message})`,
            "background: red; color: white;",
          );
          errorList.push(productName);
        } else {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }
    }
    return null;
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      let totalItemsInPage = items.length;
      console.log(
        `%c \n--- 📄 পেজ: ${pageCount} (আইটেম সংখ্যা: ${totalItemsInPage}) ---`,
        "background: #000000; color: white; padding: 5px 10px;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let titleParts = linkEl.innerText.trim().split("\n");
        let cleanTitle = titleParts[titleParts.length - 1].trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .replace(",", ".")
            .trim() || "0";

        let details = await getProductDetails(
          linkEl.href,
          cleanTitle,
          i + 1,
          totalItemsInPage,
        );

        if (details) {
          uniqueProductCount++;
          let totalRows = Math.max(
            details.sizes.length,
            details.images.length,
            1,
          );

          for (let j = 0; j < totalRows; j++) {
            let isFirstRow = j === 0;
            let size = details.sizes[j] || "";
            let imgSrc = details.images[j] || "";

            // ইউনিক বারকোড তৈরির লজিক
            let barcodeSuffix = size ? size.charCodeAt(0).toString() : "00";
            let generatedBarcode = `888${details.productId}${barcodeSuffix}`;

            allProducts.push({
              Handle: details.handleFromUrl, // URL থেকে হ্যান্ডেল
              Title: isFirstRow ? cleanTitle : "",
              "Body (HTML)": isFirstRow ? details.bodyHTML : "",
              Vendor: isFirstRow ? "Kangroute" : "",
              "Product Category": "",
              Type: isFirstRow ? "Motorcycle Gear" : "",
              Tags: isFirstRow ? "Goyamoto, Motorcycle" : "",
              Published: "TRUE",
              "Option1 Name":
                (isFirstRow && details.sizes.length > 0) || size
                  ? "Size"
                  : isFirstRow
                    ? "Title"
                    : "",
              "Option1 Value":
                size ||
                (isFirstRow && details.sizes.length === 0
                  ? "Default Title"
                  : ""),
              "Variant SKU": size
                ? `${details.skuRef}-${size.split(" ")[0]}`
                : isFirstRow
                  ? details.skuRef
                  : "",
              "Variant Grams": "0",
              "Variant Inventory Tracker": size || isFirstRow ? "shopify" : "",
              "Variant Inventory Qty": size || isFirstRow ? "100" : "",
              "Variant Inventory Policy": size || isFirstRow ? "deny" : "",
              "Variant Fulfillment Service": size || isFirstRow ? "manual" : "",
              "Variant Price": size || isFirstRow ? price : "",
              "Variant Requires Shipping": "TRUE",
              "Variant Taxable": "TRUE",
              "Variant Barcode": size || isFirstRow ? generatedBarcode : "", // বারকোড কলাম
              "Image Src": imgSrc,
              "Image Position": imgSrc ? j + 1 : "",
              "Image Alt Text": isFirstRow ? cleanTitle : "",
              "Variant Image":
                size && imgSrc ? imgSrc : isFirstRow && imgSrc ? imgSrc : "",
              Status: isFirstRow ? "active" : "",
            });
          }
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        await new Promise((r) => setTimeout(r, 800));
      }

      let nextBtn = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerHTML.includes("pagiDER") || a.innerText.includes("»"),
      );

      if (nextBtn) {
        console.log(
          `%c পেজ ${pageCount} সম্পন্ন। পরবর্তী পেজে যাচ্ছি...`,
          "color: #9b59b6;",
        );
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else {
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    if (allProducts.length === 0) return;
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const csvContent = "\uFEFF" + headers + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kangroute_final_master.csv`;
    link.click();

    console.log(
      "%c সমাপ্ত! মোট সফল প্রোডাক্ট: " + uniqueProductCount,
      "color: #2ecc71; font-weight: bold; font-size: 16px;",
    );
  }

  start();
})();

// Final with barcode skus size image desc title handle price variant image url

(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let pageCount = 1;

  console.clear();
  console.log(
    "%c 🚀 [SYSTEM] স্ক্র্যাপার স্টার্ট হচ্ছে... ডাটা সংগ্রহ এবং লাইভ অডিট শুরু হলো। ",
    "background: #222; color: #ffeb3b; padding: 10px; font-weight: bold; border-left: 5px solid #ff9800; font-size: 14px;",
  );

  async function getProductDetails(url, productName, currentItem, totalItems) {
    try {
      // URL থেকে হ্যান্ডেল সংগ্রহ
      let urlParts = url.split("/");
      let handleFromUrl =
        urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];

      // কনসোলে বড় করে নাম দেখানো (ব্যাকগ্রাউন্ড কালারসহ)
      console.log(
        `%c 🔎 বর্তমানে কাজ চলছে: ${productName.toUpperCase()} `,
        "background: #000000; color: white; padding: 4px; border-radius: 3px; font-weight: bold;",
      );

      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let text = new TextDecoder("utf-8").decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // ১. SKU সংগ্রহ (REF: GM140 NEGRO)
      let mainSku = "SKU-UNKNOWN";
      let h4s = doc.querySelectorAll("h4");
      for (let h4 of h4s) {
        if (h4.innerText.includes("REF:")) {
          mainSku = h4.innerText.split("REF:")[1].trim().replace(/"/g, "");
          break;
        }
      }

      // ২. ইমেজ সংগ্রহ
      let imgElements = doc.querySelectorAll(
        "#itemimatges img, .jcarousel li img",
      );
      let uniqueImages = [
        ...new Set(
          Array.from(imgElements).map((img) => img.src.replace("/mobile", "/")),
        ),
      ];
      if (uniqueImages.length === 0)
        uniqueImages.push(doc.querySelector("#my_image")?.src || "");

      // ৩. সাইজ সংগ্রহ
      let sizes = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      // ৪. বডি/ডেসক্রিপশন
      let introText = doc.querySelector("h2")?.innerText.trim() || "";
      let featuresList = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<div><p>${introText}</p><ul>${featuresList}</ul></div>`;

      // লাইভ ডিটেইলস রিপোর্ট (কনসোলে কালারফুল স্টাইল)
      console.log(
        `%c  ⮕ 📊 প্রোগ্রেস: [${currentItem}/${totalItems}] | 🆔 SKU: ${mainSku} | 🖼️ ছবি: ${uniqueImages.length} | 📏 সাইজ: ${sizes.length} `,
        "color: #2701ff; font-weight: bold;",
      );
      console.log(
        `%c  ⮕ 🔗 হ্যান্ডেল: ${handleFromUrl}`,
        "color: #00be56; font-style: italic;",
      );

      return { images: uniqueImages, sizes, bodyHTML, mainSku, handleFromUrl };
    } catch (err) {
      console.log(
        `%c ❌ এরর: ${productName} সংগ্রহ করা যায়নি! `,
        "background: red; color: white;",
      );
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      console.log(
        `%c \n 📄 পেজ: ${pageCount} | আইটেম সংখ্যা: ${items.length} ------------------- `,
        "background: #444; color: #23f150; padding: 5px; font-weight: bold;",
      );

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let originalTitle = linkEl.innerText.trim().split("\n").pop().trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .replace(",", ".")
            .trim() || "0";

        let d = await getProductDetails(
          linkEl.href,
          originalTitle,
          i + 1,
          items.length,
        );

        if (d) {
          uniqueProductCount++;
          let maxRows = Math.max(d.sizes.length, d.images.length);

          for (let j = 0; j < maxRows; j++) {
            let isFirstRow = j === 0;
            let currentSize = d.sizes[j] || "";
            let currentImg = d.images[j] || "";
            let isNewVariant = currentSize !== "";

            allProducts.push({
              Handle: d.handleFromUrl,
              Title: isFirstRow ? originalTitle : "",
              "Body (HTML)": isFirstRow ? d.bodyHTML : "",
              Vendor: isFirstRow ? "Kangroute" : "",
              Type: isFirstRow ? "Motorcycle Gear" : "",
              Tags: isFirstRow ? "Goyamoto, Motorcycle" : "",
              Published: "TRUE",
              "Option1 Name": isFirstRow
                ? d.sizes.length > 0
                  ? "Size"
                  : "Title"
                : "",
              "Option1 Value": currentSize || (isFirstRow ? "TALLA ÚNICA" : ""),
              "Variant SKU": isNewVariant
                ? `${d.mainSku}-${currentSize.split(" ")[0]}`
                : isFirstRow
                  ? d.mainSku
                  : "",
              "Variant Inventory Tracker":
                isNewVariant || isFirstRow ? "shopify" : "",
              "Variant Inventory Qty": isNewVariant || isFirstRow ? "100" : "",
              "Variant Price": isNewVariant || isFirstRow ? price : "",
              "Variant Requires Shipping":
                isFirstRow || isNewVariant ? "TRUE" : "",
              "Variant Taxable": isFirstRow || isNewVariant ? "TRUE" : "",
              "Image Src": currentImg,
              "Image Position": currentImg ? j + 1 : "",
              "Image Alt Text": isFirstRow ? originalTitle : "",
              "Variant Image": isNewVariant
                ? currentImg
                : isFirstRow
                  ? currentImg
                  : "",
              Status: isFirstRow ? "active" : "",
            });
          }
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        // প্রতি আইটেম পর পর ১ সেকেন্ড ওয়েট যাতে ব্লক না করে
        await new Promise((r) => setTimeout(r, 1000));
      }

      let next = Array.from(document.querySelectorAll("#paginator a")).find(
        (a) => a.innerText.includes("»"),
      );
      if (next) {
        console.log(
          "%c ⏩ পেজ শেষ। পরবর্তী পেজে যাওয়া হচ্ছে... ",
          "color: #ea80fc;",
        );
        next.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 6000));
      } else break;
    }
    downloadCSV();
  }

  function downloadCSV() {
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + "\n" + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `kangroute_live_scraped.csv`;
    link.click();

    console.log(
      `%c ✅ মিশন সফল! মোট সংগৃহীত প্রোডাক্ট: ${uniqueProductCount} `,
      "background: #00c853; color: white; padding: 15px; font-size: 20px; font-weight: bold; border-radius: 5px;",
    );
  }

  start();
})();

//আমি আপনার জন্য কনসোল আউটপুটটি একদম নিখুঁতভাবে সাজিয়েছি যেখানে Title, Handle, এবং SKU একদম সম্পূর্ণ (Full) দেখাবে, আর ডেসক্রিপশন শুধু OK স্ট্যাটাস দেখাবে। এছাড়া Size এবং Image কতটি আছে তাও সংক্ষেপে পাশে থাকবে।
(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let pageCount = 1;

  console.clear();
  console.log(
    "%c 🛰️ FULL DATA MONITOR STARTING... ",
    "background: #111; color: #00ff00; padding: 10px; font-weight: bold; border: 2px solid #00ff00;",
  );

  async function getProductDetails(url, productName, currentItem, totalItems) {
    try {
      let urlParts = url.split("/");
      let handle =
        urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
      let productId = handle.split("-")[0];

      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let text = new TextDecoder("utf-8").decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // SKU logic
      let sku = "N/A";
      let h4s = doc.querySelectorAll("h4");
      for (let h4 of h4s) {
        if (h4.innerText.includes("REF:")) {
          sku = h4.innerText.replace("REF:", "").replace(/"/g, "").trim();
          break;
        }
      }

      // Images & Sizes
      let imgs = [
        ...new Set(
          Array.from(
            doc.querySelectorAll("#itemimatges img, .jcarousel li img"),
          ).map((img) => img.src.replace("/mobile", "/")),
        ),
      ];
      let sizes = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        );

      let descText = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<div><p>${descText}</p><ul>${features}</ul></div>`;

      // --- আপনার চাহিদা অনুযায়ী ফুল ডিটেইল কনসোল রিপোর্ট ---
      console.log(
        `%c📦 [P${pageCount} | ${currentItem}/${totalItems}] %c${productName.toUpperCase()}`,
        "color: #888;",
        "color: #fff; font-weight: bold; background: #222; padding: 2px 5px; border-radius: 3px;",
      );

      console.log(
        `%c🔗 Handle: %c${handle} %c| %c🆔 SKU: %c${sku} %c| %c📏 Size: %c${sizes.length > 0 ? sizes.length : "1"} %c| %c🖼️ Img: %c${imgs.length} %c| %c📝 Desc: %c${bodyHTML.length > 30 ? "✅ OK" : "❌ EMPTY"}`,
        "color: #27ae60; font-weight: bold;",
        "color: #2ecc71;", // Handle Full
        "color: #555;",
        "color: #8e44ad; font-weight: bold;",
        "color: #9b59b6;", // SKU Full
        "color: #555;",
        "color: #f39c12; font-weight: bold;",
        "color: #f1c40f;", // Size count
        "color: #555;",
        "color: #e67e22; font-weight: bold;",
        "color: #e67e22;", // Img count
        "color: #555;",
        "color: #fff; font-weight: bold;",
        "color: #fff;", // Desc status
      );

      return { images: imgs, sizes, bodyHTML, sku, handle, productId };
    } catch (err) {
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let title = linkEl.innerText.trim().split("\n").pop().trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .replace(",", ".")
            .trim() || "0";

        let d = await getProductDetails(
          linkEl.href,
          title,
          i + 1,
          items.length,
        );

        if (d) {
          uniqueProductCount++;
          let maxRows = Math.max(d.sizes.length, d.images.length, 1);

          for (let j = 0; j < maxRows; j++) {
            let isFirst = j === 0;
            let currentSize = d.sizes[j] || "";
            let currentImg = d.images[j] || "";
            let isNewVariant = currentSize !== "";

            allProducts.push({
              Handle: d.handle,
              Title: isFirst ? title : "",
              "Body (HTML)": isFirst ? d.bodyHTML : "",
              Vendor: "Kangroute",
              "Option1 Name": d.sizes.length > 0 ? "Size" : "Title",
              "Option1 Value": currentSize || "TALLA ÚNICA",
              "Variant SKU": isNewVariant || isFirst ? d.sku : "",
              "Variant Price": isNewVariant || isFirst ? price : "",
              "Variant Barcode":
                isNewVariant || isFirst ? `888${d.productId}${j}` : "",
              "Image Src": currentImg,
              "Image Position": currentImg ? j + 1 : "",
              Status: "active",
            });
          }
          // স্পেসার রো
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      // নেক্সট পেজ লজিক
      let nextBtn =
        document.querySelector(".pagiDER a") ||
        Array.from(document.querySelectorAll("#paginator a")).find((a) =>
          a.innerText.includes("»"),
        );
      if (nextBtn) {
        console.log(
          `%c ⏩ পেজ ${pageCount} শেষ। পরবর্তী পেজে যাচ্ছি... `,
          "color: #9b59b6; font-weight: bold;",
        );
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 8000));
      } else break;
    }
    downloadCSV();
  }

  function downloadCSV() {
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + "\n" + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_full_data_audit.csv`;
    link.click();
    console.log(
      `%c ✅ অডিট সম্পন্ন! মোট প্রোডাক্ট: ${uniqueProductCount} `,
      "background: #27ae60; color: white; padding: 10px; font-size: 18px;",
    );
  }

  start();
})();

// এই রিপোর্টে আপনি যা যা দেখতে পাবেন:
// Handle, SKU, Barcode: এগুলো পুরো (Full) দেখাবে।
// Size: শুধু সংখ্যা দেখাবে (যেমন: Size: 5) যা নির্দেশ করবে কয়টি সাইজ পাওয়া গেছে।
// Img: শুধু সংখ্যা দেখাবে (যেমন: Img: 3)।
// Desc: শুধু OK অথবা EMPTY দেখাবে।
// CSV Columns: আপনার চাহিদামত Handle, Title, Body, Vendor, Type, Tags, Published, Option1 Name/Value, SKU, Barcode, Inventory, Price, Shipping, Taxable, Image Src/Pos/Alt, Variant Image, Status—সবগুলো কলাম ফাইলে থাকবে।

(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let pageCount = 1;

  console.clear();
  console.log(
    "%c 🛰️ ডাটা মনিটর চালু... সব কলাম সংগ্রহ করা হচ্ছে। ",
    "background: #111; color: #00ff00; padding: 10px; font-weight: bold; border: 2px solid #00ff00;",
  );

  async function getProductDetails(url, productName, currentItem, totalItems) {
    try {
      let urlParts = url.split("/");
      let handle =
        urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
      let productId = handle.split("-")[0];

      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let text = new TextDecoder("utf-8").decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      // SKU Logic
      let sku = "N/A";
      let h4s = doc.querySelectorAll("h4");
      for (let h4 of h4s) {
        if (h4.innerText.includes("REF:")) {
          sku = h4.innerText.replace("REF:", "").replace(/"/g, "").trim();
          break;
        }
      }

      // Images & Sizes
      let imgs = [
        ...new Set(
          Array.from(
            doc.querySelectorAll("#itemimatges img, .jcarousel li img"),
          ).map((img) => img.src.replace("/mobile", "/")),
        ),
      ];
      let sizes = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        )
        .map((s) => s.split(" ")[0].split("-")[0].trim());

      let descText = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<div><p>${descText}</p><ul>${features}</ul></div>`;
      let barcode = `888${productId}00`;

      // --- আপনার চাহিদা অনুযায়ী কনসোল রিপোর্ট ---
      console.log(
        `%c📦 [P${pageCount} | ${currentItem}/${totalItems}] %c${productName.toUpperCase()}`,
        "color: #888;",
        "color: #fff; font-weight: bold; background: #222; padding: 2px 5px;",
      );

      console.log(
        `%c🔗 Handle: %c${handle} %c| %c🆔 SKU: %c${sku} %c| %c📊 Barcode: %c${barcode} %c| %c📏 Size: %c${sizes.length > 0 ? sizes.length : "1"} %c| %c🖼️ Img: %c${imgs.length} %c| %c📝 Desc: %c${bodyHTML.length > 20 ? "OK" : "EMPTY"}`,
        "color: #27ae60; font-weight: bold;",
        "color: #2ecc71;", // Handle
        "color: #555;",
        "color: #8e44ad; font-weight: bold;",
        "color: #9b59b6;", // SKU
        "color: #555;",
        "color: #e67e22; font-weight: bold;",
        "color: #f39c12;", // Barcode
        "color: #555;",
        "color: #3498db; font-weight: bold;",
        "color: #3498db;", // Size Count
        "color: #555;",
        "color: #e74c3c; font-weight: bold;",
        "color: #e74c3c;", // Img Count
        "color: #555;",
        "color: #fff; font-weight: bold;",
        "color: #fff;", // Desc Status
      );

      return { images: imgs, sizes, bodyHTML, sku, handle, productId, barcode };
    } catch (err) {
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let title = linkEl.innerText.trim().split("\n").pop().trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .replace(",", ".")
            .trim() || "0";

        let d = await getProductDetails(
          linkEl.href,
          title,
          i + 1,
          items.length,
        );

        if (d) {
          uniqueProductCount++;
          let maxRows = Math.max(d.sizes.length, d.images.length, 1);

          for (let j = 0; j < maxRows; j++) {
            let isFirst = j === 0;
            let currentSize = d.sizes[j] || (isFirst ? "TALLA ÚNICA" : "");
            let currentImg = d.images[j] || "";

            allProducts.push({
              Handle: d.handle,
              Title: isFirst ? title : "",
              "Body (HTML)": isFirst ? d.bodyHTML : "",
              Vendor: isFirst ? "Kangroute" : "",
              Type: isFirst ? "Motorcycle Gear" : "",
              Tags: isFirst ? "Goyamoto, Motorcycle" : "",
              Published: "TRUE",
              "Option1 Name": isFirst
                ? d.sizes.length > 0
                  ? "Size"
                  : "Title"
                : "",
              "Option1 Value": currentSize,
              "Variant SKU": currentSize ? d.sku : "",
              "Variant Barcode": currentSize ? d.barcode : "",
              "Variant Inventory Tracker": currentSize ? "shopify" : "",
              "Variant Inventory Qty": currentSize ? "100" : "",
              "Variant Price": currentSize ? price : "",
              "Variant Requires Shipping": "TRUE",
              "Variant Taxable": "TRUE",
              "Image Src": currentImg,
              "Image Position": currentImg ? j + 1 : "",
              "Image Alt Text": isFirst ? title : "",
              "Variant Image": currentSize && currentImg ? currentImg : "",
              Status: "active",
            });
          }
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      let nextBtn =
        document.querySelector(".pagiDER a") ||
        Array.from(document.querySelectorAll("#paginator a")).find((a) =>
          a.innerText.includes("»"),
        );
      if (nextBtn) {
        nextBtn.click();
        pageCount++;
        await new Promise((r) => setTimeout(r, 8000));
      } else break;
    }
    downloadCSV();
  }

  function downloadCSV() {
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + "\n" + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_final_ready.csv`;
    link.click();
    console.log(
      `%c ✅ মিশন সফল! মোট প্রোডাক্ট: ${uniqueProductCount} `,
      "background: #27ae60; color: white; padding: 10px; font-size: 20px; font-weight: bold;",
    );
  }

  start();
})();

// 100% working
/*Data catch korbe. same title hole next one unique hobe. pages thakle next page e jabe.and Console e shwo korbe: 
📄 PAGE: 1 | 📦 PRODUCT: 2/12 
TITLE: GAFA CUSTOM RIDER NEGRA KUM 
🔗 Handle: 9301-gafa-custom-rider-negra-kum
🆔 SKU: 105020 RIDER NEGRA KUM
📊 Barcode: 888930100 
📏 Sizes: 1 
🖼️ Imgs: 1
📝 Desc: OK
*/
(async function () {
  let allProducts = [];
  let uniqueProductCount = 0;
  let pageCount = 1;
  let seenTitles = {};

  console.clear();
  console.log(
    "%c 🚀 Nahid We START Finding Data Stay with us...",
    "background: #111; color: #00ff00; padding: 10px; font-weight: bold;",
  );

  async function getProductDetails(url, productName, currentItem, totalItems) {
    try {
      let urlParts = url.split("/");
      let handle =
        urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
      let productId = handle.split("-")[0];

      let finalTitle = productName;
      if (seenTitles[productName]) {
        let count = seenTitles[productName];
        finalTitle = `${productName} (${count})`;
        seenTitles[productName]++;
      } else {
        seenTitles[productName] = 1;
      }

      let response = await fetch(url);
      let buffer = await response.arrayBuffer();
      let text = new TextDecoder("utf-8").decode(buffer);
      let parser = new DOMParser();
      let doc = parser.parseFromString(text, "text/html");

      let sku = "N/A";
      let h4s = doc.querySelectorAll("h4");
      for (let h4 of h4s) {
        if (h4.innerText.includes("REF:")) {
          sku = h4.innerText.replace("REF:", "").replace(/"/g, "").trim();
          break;
        }
      }

      let imgs = [
        ...new Set(
          Array.from(
            doc.querySelectorAll("#itemimatges img, .jcarousel li img"),
          ).map((img) => img.src.replace("/mobile", "/")),
        ),
      ];

      let sizes = Array.from(doc.querySelectorAll("#boxsiz0 option"))
        .map((opt) => opt.innerText.trim())
        .filter(
          (s) =>
            s && !s.toLowerCase().includes("selecciona") && !s.includes("--"),
        )
        .map((s) => {
          if (s.toUpperCase().includes("TALLA ÚNICA")) return "TALLA ÚNICA"; // Full nibe
          return s.split(" ")[0].split("-")[0].trim(); // Baki gula short nibe
        });

      let descText = doc.querySelector("h2")?.innerText.trim() || "";
      let features = Array.from(doc.querySelectorAll("#itemtxt ul li"))
        .map((li) => `<li>${li.innerText.trim()}</li>`)
        .join("");
      let bodyHTML = `<div><p>${descText}</p><ul>${features}</ul></div>`;
      let barcode = `888${productId}00`;

      // --- Console Highlight and Report ---
      console.log(
        `%c 📄 PAGE: ${pageCount} | 📦 PRODUCT: ${currentItem}/${totalItems} `,
        "background: #00d659; color: #fff; padding: 2px 5px;",
      );
      console.log(
        `%c TITLE: ${finalTitle.toUpperCase()} `,
        "background: #1e88e5; color: white; font-weight: bold; padding: 5px; display: block; width: 100%;",
      );
      console.log(
        `%c🔗 Handle: %c${handle} %c| %c🆔 SKU: %c${sku} %c| %c📊 Barcode: %c${barcode} %c| %c📏 Sizes: %c${sizes.length || 1} %c| %c🖼️ Imgs: %c${imgs.length} %c| %c📝 Desc: %cOK`,
        "color: #27ae60; font-weight: bold;",
        "color: #2ecc71;",
        "color: #888;",
        "color: #9b59b6; font-weight: bold;",
        "color: #af7ac5;",
        "color: #888;",
        "color: #e67e22; font-weight: bold;",
        "color: #f39c12;",
        "color: #888;",
        "color: #00bcd4; font-weight: bold;",
        "color: #00bcd4;",
        "color: #888;",
        "color: #f06292; font-weight: bold;",
        "color: #f06292;",
        "color: #888;",
        "color: #fff; font-weight: bold;",
        "color: #fff;",
      );
      console.log("%c " + "-".repeat(100), "color: #444;");

      return {
        images: imgs,
        sizes,
        bodyHTML,
        sku,
        handle,
        productId,
        barcode,
        finalTitle,
      };
    } catch (err) {
      return null;
    }
  }

  async function start() {
    while (true) {
      let items = document.querySelectorAll(".itemIN");
      if (items.length === 0) break;

      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        let linkEl = item.querySelector("h3 a");
        if (!linkEl) continue;

        let rawTitle = linkEl.innerText.trim().split("\n").pop().trim();
        let price =
          item
            .querySelector("h5")
            ?.childNodes[0].textContent.trim()
            .replace("€", "")
            .replace(",", ".")
            .trim() || "0";

        let d = await getProductDetails(
          linkEl.href,
          rawTitle,
          i + 1,
          items.length,
        );

        if (d) {
          uniqueProductCount++;
          let hasSizes = d.sizes.length > 0;
          let maxRows = Math.max(d.sizes.length, d.images.length, 1);

          for (let j = 0; j < maxRows; j++) {
            let isFirst = j === 0;
            let currentSize = d.sizes[j] || "";
            let currentImg = d.images[j] || "";

            // Shopify standard logic: Size na thakle jodi extra image row hoy, tobe baki info faka hobe
            let isVariantRow = hasSizes ? currentSize !== "" : isFirst;

            allProducts.push({
              Handle: d.handle,
              Title: isFirst ? d.finalTitle : "",
              "Body (HTML)": isFirst ? d.bodyHTML : "",
              Vendor: isFirst ? "Kangroute" : "",
              Type: isFirst ? "Motorcycle Gear" : "",
              Tags: isFirst ? "Goyamoto, Motorcycle" : "",
              Published: "TRUE",
              "Option1 Name": isFirst ? (hasSizes ? "Size" : "Title") : "",
              "Option1 Value": isVariantRow
                ? hasSizes
                  ? currentSize
                  : "TALLA ÚNICA"
                : "",
              "Variant SKU": isVariantRow ? d.sku : "",
              "Variant Barcode": isVariantRow ? d.barcode : "",
              "Variant Inventory Tracker": isVariantRow ? "shopify" : "",
              "Variant Inventory Qty": isVariantRow ? "100" : "",
              "Variant Price": isVariantRow ? price : "",
              "Variant Requires Shipping": isVariantRow ? "TRUE" : "",
              "Variant Taxable": isVariantRow ? "TRUE" : "",
              "Image Src": currentImg,
              "Image Position": currentImg ? j + 1 : "",
              "Image Alt Text": isFirst ? d.finalTitle : "",
              "Variant Image": isVariantRow && currentImg ? currentImg : "",
              Status: isFirst ? "active" : "",
            });
          }
          allProducts.push(
            Object.fromEntries(Object.keys(allProducts[0]).map((k) => [k, ""])),
          );
        }
        await new Promise((r) => setTimeout(r, 1000));
      }

      // --- পেজিনেশন লজিক ---
      let nextBtn = document
        .querySelector('img[src*="pagiDER.gif"]')
        ?.closest("a");

      if (nextBtn) {
        console.log(
          `%c ⏩ পেজ ${pageCount} শেষ। পরবর্তী পেজে যাচ্ছি...Please wait... `,
          "background: #8e44ad; color: #fff; padding: 5px; font-weight: bold;",
        );
        nextBtn.click();
        pageCount++;
        // পেজ পুরোপুরি রিফ্রেশ হওয়ার জন্য ওয়েট
        await new Promise((r) => setTimeout(r, 8000));
      } else {
        console.log(
          "%c 🏁 আর কোনো পেজ পাওয়া যায়নি। ",
          "background: #c0392b; color: #fff; padding: 5px;",
        );
        break;
      }
    }
    downloadCSV();
  }

  function downloadCSV() {
    const headers = Object.keys(allProducts[0]).join(",");
    const rows = allProducts
      .map((p) =>
        Object.values(p)
          .map((v) => `"${(v || "").toString().replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + headers + "\n" + rows], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `shopify_final_ready.csv`;
    link.click();
    console.log(
      `%c ✅ মিশন সফল! মোট প্রোডাক্ট: ${uniqueProductCount} `,
      "background: #27ae60; color: white; padding: 10px; font-size: 20px; font-weight: bold;",
    );
  }

  start();
})();
