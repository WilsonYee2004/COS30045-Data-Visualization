document.addEventListener("DOMContentLoaded", () => {
  setupLineChart();
});

function setupLineChart() {
  const container = document.querySelector("#line-chart");
  if (!container) return;

  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const width = 600;
  const height = 400;

  const svg = d3.select("#line-chart")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("border", "1px solid #ccc")
      .style("width", "100%")
      .style("height", "auto");

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  d3.csv("assets/data/ARE_Spot_Prices.csv", d => {
    const keys = Object.keys(d);
    const lastKey = keys[keys.length - 1];
    
    return {
      year: +d.Year,
      averagePrice: +d[lastKey]
    };
  }).then(data => {
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.averagePrice) * 1.1])
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    innerChart.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis);

    innerChart.append("g")
      .call(yAxis);

    innerChart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Average Price ($/MWh)");

    innerChart.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.averagePrice))
      .attr("r", 4)
      .attr("fill", "#6b5738");

    const lineGenerator = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.averagePrice));

    innerChart.append("path")
      .datum(data)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#6b5738")
      .attr("stroke-width", 2);

  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
}