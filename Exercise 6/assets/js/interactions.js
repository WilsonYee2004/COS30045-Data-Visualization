// Exercise 6.2: Histogram Filters
function populateFilters(data) {
  const filterContainer = d3.select("#filters_screen"); // Create button  

  filterContainer.selectAll(".filter-btn")
    .data(filters) //shared-constants.js
    .join("button")
    .attr("class", d => d.isActive ? "filter-btn active" : "filter-btn")
    .text(d => d.label) //All, LCD, LED

    .on("click", (event, d) => {
      //Set button to inactive
      filters.forEach(f => f.isActive = false);
      d.isActive = true;

      //Update visual state of all buttons
      filterContainer.selectAll(".filter-btn")
        .classed("active", f => f.isActive);

      updateHistogram(d.id, data);
    });

  function updateHistogram(filterId, allData) {
    let updatedData = allData;
    
    if (filterId !== "all") {
      updatedData = allData.filter(d => d.screenType === filterId);
    }

    //Recalculate data bins
    const updatedBins = binGenerator(updatedData);
    const innerChart = d3.select("#histogram-chart g");

    innerChart.selectAll(".bar")
      .data(updatedBins)
      .join(
        enter => enter.append("rect")
          .attr("class", "bar")
          .attr("x", d => xScale(d.x0))
          .attr("y", innerHeight)
          .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
          .attr("height", 0)
          .attr("fill", colors.bar),
        update => update,
        exit => exit.remove()
      )
      //animation
      .transition()
      .duration(750) 
      .ease(d3.easeCubicOut)
      //final position
      .attr("x", d => xScale(d.x0))
      .attr("y", d => yScale(d.length))
      .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr("height", d => innerHeight - yScale(d.length));
  }
}

//Exercise 6.4: Tooltips & Mouse Events
let tooltip; 

//create Tooltip SVG structure
function createTooltip() {
  tooltip = innerChartS.append("g")
    .attr("id", "tooltip")
    .style("opacity", 0)
    .style("pointer-events", "none"); 

  //add background rectangle
  tooltip.append("rect")
    .attr("width", tooltipDimensions.width)
    .attr("height", tooltipDimensions.height)
    .attr("x", 10)  
    .attr("y", -20) 
    .attr("rx", 5)  
    .attr("ry", 5)
    .attr("fill", colors.bar)
    .attr("opacity", 0.9); 

  //add text label
  tooltip.append("text")
    .attr("x", 10 + tooltipDimensions.width / 2) 
    .attr("y", -20 + tooltipDimensions.height / 2 + 4) 
    .attr("text-anchor", "middle")
    .style("fill", "#ffffff") 
    .style("font-size", "12px")
    .style("font-weight", "bold");
}

function handleMouseEvents() {
  innerChartS.selectAll("circle")
    .on("mouseenter", (e, d) => {
      //get the center coordinates (cx, cy)
      const cx = +e.target.getAttribute("cx");
      const cy = +e.target.getAttribute("cy");

      //update Tooltip text
      tooltip.select("text")
        .text("Size: " + d.screenSize + '"');

      //move and show Tooltip
      tooltip
        .attr("transform", "translate(" + cx + "," + cy + ")")
        .transition()
        .duration(200)
        .style("opacity", 1);
        
      //highlight hovered circle
      d3.select(e.target)
        .attr("opacity", 1)
        .attr("stroke", "#333")
        .attr("stroke-width", 2);
    })
    .on("mouseleave", (e, d) => {
      //hide Tooltip
      tooltip.transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", () => {
           tooltip.attr("transform", "translate(-1000, -1000)");
        });

      //restore original circle style
      d3.select(e.target)
        .attr("opacity", 0.5)
        .attr("stroke", "none");
    });
}