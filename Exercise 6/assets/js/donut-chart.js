//Execute the donut chart setup function
document.addEventListener("DOMContentLoaded", () => {
  setupDonutChart();
});

function setupDonutChart() {
  //Get the chart container
  const container = document.querySelector("#donut-chart");
  if (!container) return;

  //Set Chart Dimensions & Radius
  const width = 600;
  const height = 400;
  const padding = 20;
  const radius = Math.min(width, height) / 2 - padding;

  //Create SVG Canvas
  const svg = d3.select("#donut-chart")
    .append("svg")
      //make the chart responsive
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

  //translate <g> to the center of the canvas
  const innerChart = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  //Load & Parse CSV Data
  d3.csv("assets/data/Data_exercise 5.3.csv", d => {
    const keys = Object.keys(d);
    return {
      category: d[keys[0]], //(small, medium, large)
      value: +d[keys[1]] //converted to number
    };
  }).then(data => {
    
    //Setup Colors & Shape Generators
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.category))
      .range(["#2196F3", "#4CAF50", "#FF9800"]);

    //calculate angles based on values
    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    //draw the actual shapes
    const arcGenerator = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .padAngle(0.02)
      .cornerRadius(4);

    const pieData = pie(data);

    //Draw Chart Slices
    innerChart.selectAll("path")
      .data(pieData)
      .join("path")
      .attr("d", arcGenerator)
      .attr("fill", d => colorScale(d.data.category))
      .attr("stroke", "#fff")
      .style("stroke-width", "2px")
      .style("transition", "opacity 0.2s ease")

      //mouse
      .on("mouseover", function() {
        d3.select(this)
          .style("opacity", 0.8)
          .style("cursor", "pointer");
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 1);
      });

    //Add Text Labels
    innerChart.selectAll("text")
      .data(pieData)
      .join("text")
      .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#fff")
      .style("pointer-events", "none") 
      .text(d => d.data.category);

  //Error handling
  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
}