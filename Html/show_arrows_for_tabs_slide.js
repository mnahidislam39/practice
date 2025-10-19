// Show arrows for tabs slide html structure

/*
  
  <div class="arrows_btn"> 
         <button class="tabs-arrow tabs-arrow--left" aria-label="Previous"><span>‹</span></button>          
          <button class="tabs-arrow tabs-arrow--right" aria-label="Next"><span>›</span></button>
</div> 
button.tabs-arrow span {
  width: 30px;
  height: 30px;
  display: flex;
  background: #000000;
  color: #fff;
  border-radius: 50px;
  align-items: center;
  justify-content: center;
}
.arrows_btn {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding-top: 16px;
}
*/

document.addEventListener("DOMContentLoaded", function () {
  const tabsWrapper = document.querySelector(".m-tabs__wrapper");
  const tabs = document.querySelectorAll(".m-tab-header");
  const leftArrow = document.querySelector(".tabs-arrow--left");
  const rightArrow = document.querySelector(".tabs-arrow--right");

  let currentIndex = 0;
  const visibleCount = 3; // একসাথে কতগুলো tab show হবে
  const tabWidth = tabs[0].offsetWidth;

  function updateTabs() {
    // wrapper translate
    const offset = -currentIndex * tabWidth;
    tabsWrapper.style.transform = `translateX(${offset}px)`;

    // active tab click trigger for products
    tabs.forEach((tab) => tab.classList.remove("active"));
    if (tabs[currentIndex]) {
      tabs[currentIndex].classList.add("active");
      tabs[currentIndex].click(); // show products
    }
  }

  rightArrow.addEventListener("click", () => {
    // loop logic
    currentIndex = (currentIndex + 1) % tabs.length;
    updateTabs();
  });

  leftArrow.addEventListener("click", () => {
    // loop logic
    currentIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    updateTabs();
  });

  // initial setup
  updateTabs();
});
