document.addEventListener("DOMContentLoaded", () => {
  setupDonutChart();
});

function setupDonutChart() {
  const container = document.querySelector("#donut-chart");
  if (!container) return;

  const width = 600;
  const height = 400;
  const padding = 20;
  const radius = Math.min(width, height) / 2 - padding;

  const svg = d3.select("#donut-chart")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("border", "1px solid #ccc")
      .style("width", "100%")
      .style("height", "auto");

  const innerChart = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  d3.csv("assets/data/Data_exercise 5.3.csv", d => {
    const keys = Object.keys(d);
    return {
      category: d[keys[0]],
      value: +d[keys[1]]
    };
  }).then(data => {
    
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.category))
      .range(["#6b5738", "#a6906a", "#d3c8b4"]);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arcGenerator = d3.arc()
      .innerRadius(radius * 0.6)
      .outerRadius(radius)
      .padAngle(0.02)
      .cornerRadius(4);

    const pieData = pie(data);

    innerChart.selectAll("path")
      .data(pieData)
      .join("path")
      .attr("d", arcGenerator)
      .attr("fill", d => colorScale(d.data.category))
      .attr("stroke", "#fff")
      .style("stroke-width", "2px");

    innerChart.selectAll("text")
      .data(pieData)
      .join("text")
      .attr("transform", d => `translate(${arcGenerator.centroid(d)})`)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "#fff")
      .text(d => d.data.category);

  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
}