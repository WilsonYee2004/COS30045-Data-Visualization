//Chart Dimensions & Margins
const margin = { top: 40, right: 30, bottom: 60, left: 60 };
//Total SVG canvas width and height
const width = 800; 
const height = 400;
//Calculate the actual drawing area
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

//Color Palette
const colors = {
  bar: "#6b5738",            
  barHover: "#9c845e",       
  bodyBackgroundColor: "#ffffff",
  lcd: "#4CAF50",            
  led: "#2196F3",            
  oled: "#FF9800"            
};

//Histogram Variables
const xScale = d3.scaleLinear();
const yScale = d3.scaleLinear();

const binGenerator = d3.bin() 
  .value(d => d.energyConsumption); //use the 'energyConsumption' value to group data into bins

const filters = [ //Configuration list for histogram filter buttons ('All' is active by default)
  { id: "all", label: "All", isActive: true },
  { id: "LCD", label: "LCD", isActive: false },
  { id: "LED", label: "LED", isActive: false },
  { id: "OLED", label: "OLED", isActive: false }
];

//Variables ending with 'S' denote Scatterplot to distinguish from histogram
let innerChartS; 
const xScaleS = d3.scaleLinear();
const yScaleS = d3.scaleLinear();
const colorScale = d3.scaleOrdinal(); 

//Pre-define the width and height of the tooltip rectangle
const tooltipDimensions = { width: 120, height: 40 };