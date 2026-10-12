//wait for DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  setupLineChart();
});

//main function to setup and draw the line chart
function setupLineChart() {
  //chart container
  const container = document.querySelector("#line-chart");
  if (!container) return;

  //set Chart Dimensions & Margins
  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const width = 600;
  const height = 400;

  //create SVG canvas with viewBox for responsive scaling
  const svg = d3.select("#line-chart")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

  //create inner chart group and translate by margins
  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  //Load & Parse CSV Data
  d3.csv("assets/data/ARE_Spot_Prices.csv", d => {
    const keys = Object.keys(d);
    const lastKey = keys[keys.length - 1];
    
    return {
      year: +d.Year,
      averagePrice: +d[lastKey]
    };
  }).then(data => {

    //scales & Grid Lines
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year)) //covering the min to max year
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.averagePrice) * 1.1]) //0 to 1.1x the maximum price
      .range([innerHeight, 0]);

    //draw background horizontal grid lines
    innerChart.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "4"); //dashed line effect
    
    //Hide the solid Y-axis domain path
    innerChart.select(".grid path").style("stroke-width", "0");

    //Axes & Labels

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale);

    //Render x and y
    innerChart.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis);

    innerChart.append("g")
      .call(yAxis);

    //Add Y axis text label
    innerChart.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Average Price ($/MWh)");

    //Draw Line & Data Points

    const lineGenerator = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.averagePrice));

    //Draw the line path
    innerChart.append("path")
      .datum(data)
      .attr("d", lineGenerator)
      .attr("fill", "none")
      .attr("stroke", "#FF9800")
      .attr("stroke-width", 2.5);

    //Draw circles for each data point
    innerChart.selectAll("circle")
      .data(data)
      .join("circle")
      .attr("cx", d => xScale(d.year))
      .attr("cy", d => yScale(d.averagePrice))
      .attr("r", 4.5)
      .attr("fill", "#FF9800")
      .style("transition", "all 0.2s ease")

      .on("mouseover", function() {
        d3.select(this)
          .attr("r", 7)
          .attr("fill", "#E65100") 
          .style("cursor", "pointer");
      })
      .on("mouseout", function() {
        d3.select(this)
          .attr("r", 4.5)
          .attr("fill", "#FF9800");
      });

  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
}