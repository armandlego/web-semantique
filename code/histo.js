var histo_query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>\
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>\
PREFIX : <http://127.0.0.1:3333/>\
SELECT ?year WHERE {\
  ?sub rdf:type :Album ;\
       :wasReleasedIn ?year.\
}"



// set the dimensions and margins of the graph
const histo_margin = { top: 10, right: 50, bottom: 30, left: 60 },
  histo_width = document.getElementById('histo').getBoundingClientRect().width - histo_margin.left - histo_margin.right,
  histo_height = document.getElementById('histo').getBoundingClientRect().height - histo_margin.top - histo_margin.bottom;

// append the svg object to the body of the page
const histo_svg = d3.select("#histo")
  .append("svg")
  .attr("width", histo_width + histo_margin.left + histo_margin.right)
  .attr("height", histo_height + histo_margin.top + histo_margin.bottom)
  .append("g")
  .attr("transform",
    `translate(${histo_margin.left},${histo_margin.top})`);

let bin_filter = function (rect, x0, x1) {

  if (rect.classList.contains("focused")) {
    document.querySelectorAll("#histo svg rect").forEach(element => {
      element.classList.remove("focused")
      element.classList.add("unfocused")
    })
    load_list()
  }
  else {
    document.querySelectorAll("#histo svg rect").forEach(element => {
      element.classList.remove("focused")
      element.classList.add("unfocused")
    })
    rect.classList.add("focused")
    load_list(x0, x1)
  }
}

// get the data
sparql(endpointURL, histo_query).then(function (data) {

  // X axis: scale and draw:
  const x = d3.scaleLinear()
    .domain([d3.min(data, function (d) { return +d.year }), d3.max(data, function (d) { return +d.year }) + (10 - d3.max(data, function (d) { return +d.year }) % 10)])
    .range([0, histo_width]);
  histo_svg.append("g")
    .attr("transform", `translate(0, ${histo_height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("d")));

  // set the parameters for the histogram
  const histogram = d3.histogram()
    .value(function (d) { return d.year; })   // I need to give the vector of value
    .domain(x.domain())  // then the domain of the graphic
    .thresholds(x.ticks((d3.max(data, function (d) { return +d.year }) - d3.min(data, function (d) { return +d.year })) / 10)) // then the numbers of bins
  // And apply this function to data to get the bins
  const bins = histogram(data);

  // Y axis: scale and draw:
  const y = d3.scaleLinear()
    .range([histo_height, 0]);
  y.domain([0, d3.max(bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  histo_svg.append("g")
    .call(d3.axisLeft(y));

  // append the bar rectangles to the svg element
  histo_svg.selectAll("rect")
    .data(bins)
    .join("rect")
    .attr("x", 1)
    .attr("transform", function (d) { return `translate(${x(d.x0)} , ${y(d.length)})` })
    .attr("width", function (d) { return x(d.x1) - x(d.x0) - 1 })
    .attr("height", function (d) { return histo_height - y(d.length); })
    .attr("onclick", function (d) { return "bin_filter(this," + d.x0 + "," + d.x1 + ")" })
    .attr("class", "unfocused")

});


