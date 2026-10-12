//main function to draw the scatterplot
function drawScatterplot(data) {
  const container = d3.select("#scatterplot");
  container.selectAll("*").remove(); //clear all previous elements

  //use viewBox to make the chart responsive
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", "100%")
    .style("height", "auto");

  innerChartS = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Set up Scales
  const maxStar = d3.max(data, d => d.starRating);
  xScaleS.domain([0, maxStar + 1]).range([0, innerWidth]);

  const maxEnergy = d3.max(data, d => d.energyConsumption);
  yScaleS.domain([0, maxEnergy * 1.1]).range([innerHeight, 0]);

  //Extract all unique screen types from the data
  const screenTypes = [...new Set(data.map(d => d.screenType))];
  colorScale.domain(screenTypes).range(["#6b5738", "#a6906a", "#e8a13d"]);

  //Draw Data Points / Circles
  innerChartS.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d => xScaleS(d.starRating))
    .attr("cy", d => yScaleS(d.energyConsumption))
    .attr("r", 5) //radius
    .attr("fill", d => colorScale(d.screenType))
    .attr("opacity", 0.5); 

  //Axes & Labels
  innerChartS.append("g") //Draw bottom X-axis
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScaleS));

  innerChartS.append("g") //Draw left Y-axis
    .call(d3.axisLeft(yScaleS));

  innerChartS.append("text") //X-axis label
    .attr("class", "axis-label")
    .attr("y", innerHeight + 40)
    .attr("x", innerWidth / 2)
    .attr("text-anchor", "middle")
    .text("Star Rating");

  innerChartS.append("text") //Y-axis label
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -45)
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Energy Consumption (kWh)");

  //Draw Legend
  const legend = innerChartS.append("g")
    .attr("transform", `translate(${innerWidth - 80}, 10)`);

  //spaced vertically based on index 'i'
  screenTypes.forEach((type, i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(0, ${i * 20})`);

    //Draw legend color square
    legendRow.append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", colorScale(type));

    //Draw legend text
    legendRow.append("text")
      .attr("class", "axis-label")
      .attr("x", 20)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .style("font-size", "12px")
      .style("text-transform", "uppercase")
      .text(type);
  });
}