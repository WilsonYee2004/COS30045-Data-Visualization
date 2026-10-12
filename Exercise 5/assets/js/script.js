document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(link => {
    const linkPage = link.getAttribute("href");
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

  setupFAQ();
  setupCalculator();
  setupD3Chart();

  const yearSpan = document.getElementById("year");
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
});

function setupFAQ() {
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach(btn => {
    btn.addEventListener("click", () => {
      const answer = btn.nextElementSibling;
      const isOpen = answer.classList.contains("open");

      document.querySelectorAll(".faq-answer.open").forEach(a => a.classList.remove("open"));
      document.querySelectorAll(".faq-question.open").forEach(q => q.classList.remove("open"));

      if (!isOpen) {
        answer.classList.add("open");
        btn.classList.add("open");
      }
    });
  });
}

function setupCalculator() {
  const form = document.getElementById("calc-form");
  if (!form) return;

  const applianceSelect = document.getElementById("appliance-select");
  const wattsInput = document.getElementById("watts-input");
  const hoursInput = document.getElementById("hours-input");
  const priceInput = document.getElementById("price-input");
  const errorMsg = document.getElementById("calc-error");
  const resultsPanel = document.getElementById("results-panel");

  const appliancePresets = {
    "": null,
    "led-tv": 100,
    "fridge": 150,
    "washing-machine": 500,
    "air-conditioner": 2000,
    "microwave": 1200
  };

  applianceSelect.addEventListener("change", () => {
    const preset = appliancePresets[applianceSelect.value];
    if (preset !== null) {
      wattsInput.value = preset;
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    errorMsg.style.display = "none";

    const watts = parseFloat(wattsInput.value);
    const hours = parseFloat(hoursInput.value);
    const price = parseFloat(priceInput.value);

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

    const dailyKWh = (watts * hours) / 1000;
    const monthlyKWh = dailyKWh * 30;
    const yearlyKWh = dailyKWh * 365;

    const monthlyCost = (monthlyKWh * price) / 100;
    const yearlyCost = (yearlyKWh * price) / 100;

    document.getElementById("res-daily-kwh").textContent = dailyKWh.toFixed(2) + " kWh";
    document.getElementById("res-monthly-kwh").textContent = monthlyKWh.toFixed(2) + " kWh";
    document.getElementById("res-yearly-kwh").textContent = yearlyKWh.toFixed(2) + " kWh";
    document.getElementById("res-monthly-cost").textContent = "$" + monthlyCost.toFixed(2);
    document.getElementById("res-yearly-cost").textContent = "$" + yearlyCost.toFixed(2);

    resultsPanel.classList.add("show");
  });

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = "block";
    resultsPanel.classList.remove("show");
  }
}

function setupD3Chart() {
  const container = document.querySelector(".responsive-svg-container");
  if (!container) return;

  const svg = d3.select(".responsive-svg-container")
    .append("svg")
      .attr("viewBox", "0 0 500 600")
      .style("border", "1px solid black")
      .style("width", "100%")
      .style("height", "auto");

  d3.csv("assets/data/tvBrandCount.csv", d => {
    return {
      brand: d.brand,
      count: +d.count
    };
  }).then(data => {
    console.log("Loaded TV Brand Data:", data);
    drawBarChart(data, svg);
  }).catch(error => {
    console.error("Error loading the CSV file:", error);
  });
}

function drawBarChart(data, svg) {
  console.log("drawBarChart running for rows:", data.length);

  const xScale = d3.scaleLinear()
    .domain([0, 1200])
    .range([0, 300]);

  const yScale = d3.scaleBand()
    .domain(data.map(d => d.brand))
    .range([0, 550])
    .padding(0.2);

  const barAndLabel = svg
    .selectAll("g")
    .data(data)
    .join("g")
    .attr("transform", d => `translate(0, ${yScale(d.brand)})`);

  barAndLabel
    .append("rect")
    .attr("x", 100)
    .attr("y", 0)
    .attr("width", d => xScale(d.count))
    .attr("height", yScale.bandwidth())
    .attr("fill", "#6b5738");

  barAndLabel
    .append("text")
    .text(d => d.brand)
    .attr("x", 90)
    .attr("y", 15)
    .attr("text-anchor", "end")
    .style("font-size", "11px");

  barAndLabel
    .append("text")
    .text(d => d.count)
    .attr("x", d => 100 + xScale(d.count) + 5)
    .attr("y", 15)
    .style("font-size", "11px");
}