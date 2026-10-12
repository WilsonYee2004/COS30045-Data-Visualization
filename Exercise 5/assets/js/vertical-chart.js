document.addEventListener("DOMContentLoaded", () => {
  setupVerticalBarChart();
});

function setupVerticalBarChart() {
  const container = document.querySelector("#bar-chart");
  if (!container) return;

  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const width = 600;
  const height = 400;

  const svg = d3.select("#bar-chart")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("border", "1px solid #ccc")
      .style("width", "100%")
      .style("height", "auto");

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  d3.csv("assets/data/Data_exercise 5.1.csv", d => {
    return {
      screenType: d["Screen_Tech"],
      energy: +d["Mean(Labelled energy consumption (kWh/year))"]
    };
  }).then(data => {
    data.sort((a, b) => d3.ascending(a.energy, b.energy));

    const xScale = d3.scaleBand()
      .domain(data.map(d => d.screenType))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.energy) * 1.1])
      .range([innerHeight, 0]);

    innerChart.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
        .attr("transform", "rotate(-15)")
        .style("text-anchor", "end");

    innerChart.append("g")
      .call(d3.axisLeft(yScale));

    innerChart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Average Energy Consumption (kWh)");

    innerChart.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.screenType))
      .attr("y", d => yScale(d.energy))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.energy))
      .attr("fill", "#6b5738");

    innerChart.selectAll(".bar-label")
      .data(data)
      .join("text")
      .attr("class", "bar-label")
      .text(d => d.energy.toFixed(0))
      .attr("x", d => xScale(d.screenType) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.energy) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "10px");

  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
}