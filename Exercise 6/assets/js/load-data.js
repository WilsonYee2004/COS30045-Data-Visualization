//Data Loading & Initialization Controller
let tvData = [];

d3.csv("assets/data/Ex6_TVdata_withStar.csv", d => {
  //Format the raw string data from CSV
  return {
    brand: d.brand,
    model: d.model,
    screenSize: +d.screenSize,
    screenType: d.screenTech,
    starRating: +d.star,
    energyConsumption: +d.energyConsumption
  };
}).then(data => {
  tvData = data;
  
  drawHistogram(tvData);
  populateFilters(tvData); //generate filter buttons and bind click events
  drawScatterplot(tvData);
  
  createTooltip();
  handleMouseEvents();
  
}).catch(error => {
  console.error(error);
});