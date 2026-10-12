//Main function to draw the histogram
function drawHistogram(data) {
  const container = d3.select("#histogram-chart");
  container.selectAll("*").remove(); 

  //Create SVG Canvas
  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("width", "100%")
    .style("height", "auto");

  const innerChart = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Data Binning & Scales
  const bins = binGenerator(data);

  const binsMin = bins[0].x0;
  const binsMax = bins[bins.length - 1].x1;
  const binsMaxLength = d3.max(bins, d => d.length);

  xScale.domain([binsMin, binsMax]).range([0, innerWidth]);
  yScale.domain([0, binsMaxLength]).range([innerHeight, 0]);

  //Draw Chart Elements
  innerChart.append("g")
    .attr("class", "grid")
    .call(d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .tickFormat("") 
    );

  //Draw the histogram bars
  innerChart.selectAll(".bar")
    .data(bins)
    .join("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.x0))
    .attr("y", d => yScale(d.length))
    .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1)) 
    .attr("height", d => innerHeight - yScale(d.length))
    .attr("fill", colors.bar);

  //Axes & Labels
  innerChart.append("g") //X
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(xScale));

  innerChart.append("g") //Y
    .call(d3.axisLeft(yScale));

  //Draw Y-axis label text
  innerChart.append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -45)
    .attr("x", -innerHeight / 2)
    .attr("text-anchor", "middle")
    .text("Frequency");

  //Draw X-axis label text
  innerChart.append("text")
    .attr("class", "axis-label")
    .attr("y", innerHeight + 40)
    .attr("x", innerWidth / 2)
    .attr("text-anchor", "middle")
    .text("Energy Consumption (kWh)");
}