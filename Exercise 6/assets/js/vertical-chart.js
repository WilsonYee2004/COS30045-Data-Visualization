//Wait for DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
  setupVerticalBarChart();
});

function setupVerticalBarChart() {
  const container = document.querySelector("#bar-chart"); //Get the chart container
  if (!container) return;

  //Set Chart Dimensions & Margins
  const margin = { top: 40, right: 30, bottom: 60, left: 60 };
  const width = 600;
  const height = 400;

  //Create SVG canvas with viewBox for responsive scaling
  const svg = d3.select("#bar-chart")
    .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("width", "100%")
      .style("height", "auto");

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Calculate inner drawing dimensions
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const colorMap = { //define color map for screen technologies
    "LCD": "#4CAF50",
    "LED": "#2196F3",
    "OLED": "#FF9800"
  };

  //Load & Parse CSV Data
  d3.csv("assets/data/Data_exercise 5.1.csv", d => {
    return {
      screenType: d["Screen_Tech"],
      energy: +d["Mean(Labelled energy consumption (kWh/year))"]
    };
  }).then(data => {
    data.sort((a, b) => d3.ascending(a.energy, b.energy)); //Sort data small to big

    //Scales & Grid Lines
    const xScale = d3.scaleBand() //Band scale, designed for categorical data
      .domain(data.map(d => d.screenType))
      .range([0, innerWidth])
      .padding(0.3);

    const yScale = d3.scaleLinear() //Linear scale for numerical data
      .domain([0, d3.max(data, d => d.energy) * 1.1])
      .range([innerHeight, 0]);

    innerChart.append("g") //draw background horizontal grid lines
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-innerWidth)
        .tickFormat("")
      )
      .selectAll("line")
      .style("stroke", "#e0e0e0")
      .style("stroke-dasharray", "4");
    //Hide default solid axis line
    innerChart.select(".grid path").style("stroke-width", "0");

    //Axes & Labels
    innerChart.append("g") //Draw X-axis and rotate labels -15 degrees to prevent overlapping
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
        .attr("transform", "rotate(-15)")
        .style("text-anchor", "end")
        .style("font-weight", "bold");

    innerChart.append("g") //Draw Y-axis
      .call(d3.axisLeft(yScale));

    innerChart.append("text") //Add Y-axis main title
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -innerHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text("Average Energy Consumption (kWh)");

    //Draw Bars & Value Labels
    //Draw rectangles for each data point
    innerChart.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.screenType))
      .attr("y", d => yScale(d.energy))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yScale(d.energy))
      //Apply color from colorMap, fallback to default brown if not found
      .attr("fill", d => colorMap[d.screenType] || "#6b5738")
      .style("transition", "opacity 0.2s")
      .on("mouseover", function() {
        d3.select(this).style("opacity", 0.7).style("cursor", "pointer");
      })
      .on("mouseout", function() {
        d3.select(this).style("opacity", 1);
      });

    //Draw precise value text on top of each bar
    innerChart.selectAll(".bar-label")
      .data(data)
      .join("text")
      .attr("class", "bar-label")
      .text(d => d.energy.toFixed(0)) //Round value to zero decimals(0.6 -> 1)
      .attr("x", d => xScale(d.screenType) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.energy) - 8) //Offset 8px upwards
      .attr("text-anchor", "middle")
      .style("font-size", "11px")
      .style("font-weight", "bold")
      .style("fill", "#333");

  }).catch(error => {
    console.error("Error loading CSV:", error);
  });
} 

