//page Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Automatically determine the current page and add 'active' class to the nav link
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

  //Initialize standalone featur  e modules
  setupFAQ();
  setupCalculator();
  setupD3Chart();

  //Automatically update the copyright year in the footer
  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

//FAQ Accordion
function setupFAQ() {
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach(btn => {
    btn.addEventListener("click", () => {
      //Get the answer block next to the clicked question
      const answer = btn.nextElementSibling;
      const isOpen = answer.classList.contains("open");

      //Close all currently open answers and question states
      document.querySelectorAll(".faq-answer.open").forEach(a => a.classList.remove("open"));
      document.querySelectorAll(".faq-question.open").forEach(q => q.classList.remove("open"));

      if (!isOpen) { //If it was closed, open it
        answer.classList.add("open");
        btn.classList.add("open");
      }
    });
  });
}

//Energy Calculator Logic
function setupCalculator() {
  const form = document.getElementById("calc-form");
  if (!form) return;

  //Get form inputs and display elements
  const applianceSelect = document.getElementById("appliance-select");
  const wattsInput = document.getElementById("watts-input");
  const hoursInput = document.getElementById("hours-input");
  const priceInput = document.getElementById("price-input");
  const errorMsg = document.getElementById("calc-error");
  const resultsPanel = document.getElementById("results-panel");

  //Preset wattage for common appliances
  const appliancePresets = {
    "": null,
    "led-tv": 100,
    "fridge": 150,
    "washing-machine": 500,
    "air-conditioner": 2000,
    "microwave": 1200
  };

  //Auto-fill wattage when user selects an appliance from the dropdown
  applianceSelect.addEventListener("change", () => {
    const preset = appliancePresets[applianceSelect.value];
    if (preset !== null) {
      wattsInput.value = preset;
    }
  });

  //Handle form submission
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";

    //parse inputs to floating-point numbers
    const watts = parseFloat(wattsInput.value);
    const hours = parseFloat(hoursInput.value);
    const price = parseFloat(priceInput.value);

    //Input validation logic
    if (isNaN(watts) || watts <= 0) {
      showError("Please enter a valid appliance power (watts) greater than 0.");
      return;
    }
    if (isNaN(hours) || hours < 0 || hours > 24) {
      showError("Hours of use per day must be between 0 and 24.");
      return;
    }
    if (isNaN(price) || price <= 0) {
      showError("Please enter a valid electricity price (cents per kWh).");
      return;
    }

    //Calculate energy consumption in kWh
    const dailyKWh = (watts * hours) / 1000;
    const monthlyKWh = dailyKWh * 30;
    const yearlyKWh = dailyKWh * 365;

    //Calculate cost in dollars
    const monthlyCost = (monthlyKWh * price) / 100;
    const yearlyCost = (yearlyKWh * price) / 100;

    //Update HTML with calculation results
    document.getElementById("res-daily-kwh").textContent = dailyKWh.toFixed(2) + " kWh";
    document.getElementById("res-monthly-kwh").textContent = monthlyKWh.toFixed(2) + " kWh";
    document.getElementById("res-yearly-kwh").textContent = yearlyKWh.toFixed(2) + " kWh";
    document.getElementById("res-monthly-cost").textContent = "$" + monthlyCost.toFixed(2);
    document.getElementById("res-yearly-cost").textContent = "$" + yearlyCost.toFixed(2);

    resultsPanel.classList.add("show"); //Show results panel
  });

  //Helper function to display error messages
  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
    resultsPanel.classList.remove("show");
  }
}

//Horizontal Bar Chart - TV Brands

function setupD3Chart() {
  const container = document.querySelector(".responsive-svg-container");
  if (!container) return; //ensure it only runs on pages with this container

  //create SVG canvas with viewBox for responsive scaling
  const svg = d3.select(".responsive-svg-container")
    .append("svg")
      .attr("viewBox", "0 0 500 600")
      .style("width", "100%")
      .style("height", "auto");

  d3.csv("assets/data/tvBrandCount.csv", d => {
    return {
      brand: d.brand,
      count: +d.count
    };
  }).then(data => {
    data.sort((a, b) => b.count - a.count); //Sort data descending by count (b - a)
    
    //Call the drawing function
    drawBarChart(data, svg);
  }).catch(error => {
    console.error("Error loading the CSV file:", error);
  });
}

//Detailed logic for drawing the horizontal bar chart
function drawBarChart(data, svg) {
  const xScale = d3.scaleLinear() //Linear scale for values, domain 0 to 1200
    .domain([0, 1200])
    .range([0, 300]);

  const yScale = d3.scaleBand() //Band scale for categorical data
    .domain(data.map(d => d.brand))
    .range([0, 550])
    .padding(0.2);

  //Draw vertical background grid lines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", "translate(100, 0)")
    .call(d3.axisBottom(xScale)
      .tickSize(550)
      .tickFormat("")
      .ticks(6)
    )
    .selectAll("line")
    .style("stroke", "#e0e0e0")
    .style("stroke-dasharray", "4");

  //Hide default solid axis line
  svg.select(".grid path").style("stroke-width", "0"); 

  const barAndLabel = svg
    .selectAll(".bar-group")
    .data(data)
    .join("g")
    .attr("class", "bar-group")
    .attr("transform", d => `translate(0, ${yScale(d.brand)})`);

  //draw the bar rectangles
  barAndLabel
    .append("rect")
    .attr("x", 100)
    .attr("y", 0)
    .attr("width", d => xScale(d.count))
    .attr("height", yScale.bandwidth())
    .attr("fill", "#6b5738")
    .style("transition", "fill 0.2s ease")
    .on("mouseover", function() {
      d3.select(this).attr("fill", "#9c845e").style("cursor", "pointer"); 
    })
    .on("mouseout", function() {
      d3.select(this).attr("fill", "#6b5738"); 
    });

  //Draw the brand name text on the left
  barAndLabel
    .append("text")
    .text(d => d.brand)
    .attr("x", 90)
    .attr("y", 15)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .style("fill", "#333");

  //Draw the count value text on the right of the bar
  barAndLabel
    .append("text")
    .text(d => d.count)
    .attr("x", d => 100 + xScale(d.count) + 8)
    .attr("y", 15)
    .style("font-size", "11px")
    .style("fill", "#666");
}