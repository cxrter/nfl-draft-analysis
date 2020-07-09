// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 60, left: 50},
    height = 600;

var bb = document.querySelector ('#my_dataviz')
                 .getBoundingClientRect(),
    width = bb.right - bb.left -200

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")


// Add the grey background
svg
  .append("rect")
    .attr("x",0)
    .attr("y",0)
    .attr("height", height)
    .attr("width", width)
    .style("fill", "EBEBEB")



//Read the data
d3.csv("../pfr_draft_data.csv", function(data) {

// filter only positive scores, there's a few negatives
var data = data.filter(function(d){
        return d.draft_av >= parseInt('0');
})

// filter only players who have been a starter for the team
var data = data.filter(function(d){
        return d.years_with_team >= parseInt('1');
})

function filter_team(team) {
var new_data = data.filter(function(d){
        return d.modern_code == team;
})
return new_data;
}



var allTeams = (d3.map(data, function(d){return(d.modern_code)}).keys()).sort()
console.log(allTeams)


//var button_html = ''
//for (i in allTeams){
//    new_data = filter_team(allTeams[i])
//    new_button = "<label class='btn btn-secondary'><input type='checkbox' value='"+allTeams[i]+"'>" + allTeams[i] + "</label>"
//    //value='"+allTeams[i]"'
//    button_html = button_html.concat(new_button)
//}
//document.getElementById("demo").innerHTML = button_html;

d3.select('#selectButton')
    .selectAll('myOptions')
        .data(allTeams)
    .enter()
        .append('option')
    .text(function(d) {return d; })
    .attr('value', function(d) { return d; })


  // Initialise X axis
  var x = d3.scaleLinear()
    .range([ 0, width ])
    .domain([0, d3.max(data, function(d) { return parseInt(d.draft_pick); })])
  var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(6).tickPadding(15))
    .select(".domain").remove()


  // Initialise Y axis
  var y = d3.scaleLinear()
    .range([ height, 0])
    .domain([0,d3.max(data, function(d) { return parseInt(d.draft_av/d.years_with_team); })])
  var yAxis = svg.append("g")
    .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(7))
    .select(".domain").remove()

 // Add X axis label:
  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + margin.top + 35)
      .text("Draft Position");

  // Y axis label:
  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 20)
      .attr("x", - height/2)
      .text("Approximate Value")

    // Customization
  svg.selectAll(".tick line").attr("stroke", "white")



  // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
  // Its opacity is set to 0: we don't see it by default.
  var tooltip = d3.select("#my_dataviz")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")


  // A function that change this tooltip when the user hover a point.
  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  var mouseover = function(d) {
    tooltip
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    tooltip
      .html(d.player + " to the " + d.short_name )
      .style("left", (d3.mouse(this)[0]+120) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1])+20 + "px")
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }





function update_chart(data) {


x
    .domain([0, d3.max(data, function(d) { return parseInt(d.draft_pick); })])
xAxis
    .transition()
    .duration(1000)
    .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(6).tickPadding(15))


y
    .domain([0,d3.max(data, function(d) { return parseInt(d.draft_av/d.years_with_team); })])
yAxis
    .transition()
    .duration(1000)
    .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(7))


  // Highlight the team that is hovered
  var highlight = function(d){

    selected_team = d.short_name

    d3.selectAll(".dot")
      .transition()
      .duration(200)
      .style("fill", "lightgrey")
      .attr("r", 3)

    d3.selectAll("." + CSS.escape(selected_team))
      .transition()
      .duration(200)
      .style("fill", function (d) { return (d.color_primary); })
      .attr("r", 7)
}

  // Highlight the team that is hovered
  var doNotHighlight = function(){
    d3.selectAll(".dot")
      .transition()
      .duration(2000)
      .style("fill", function (d) { return (d.color_primary); })
      .attr("r", 5 )
  }

 // Create a update selection: bind to the new data
  var u = svg.selectAll(".dot_test")
    .data(data);


  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", function (d) { return "dot " + d.short_name } )
      .attr("cx", function (d) { return x(d.draft_pick); } )
      .attr("cy", function (d) { return y(d.draft_av/d.years_with_team); } )
      .attr("r", 4)
      .style("fill", function (d) { return (d.color_primary); })
      .style("opacity", 1)
      .on("mouseover.hi", highlight)
      .on("mouseleave.hi", doNotHighlight )
      .on("mouseover", mouseover)
      .on("mousemove", mousemove )
      .on("mouseleave", mouseleave );


}

// initialise chart
update_chart(data)

var data = data.filter(function(d){
        return d.modern_code == 'MIA';
})


//    var radioValue = []
//    $("#demo").click(function(){
//            radioValue.push($("input:checked").val());
//            update_chart(data)
//            console.log(radioValue)    });

// When the button is changed, run the updateChart function
d3.select('#selectButton').on("change", function(d) {

    // recover the option that has been chosen
    var selectedOption = d3.select(this).property("value")

    // run the updateChart function with this selected option
    console.log(selectedOption)
})







})



// filtering data
//var filtered_data = data.filter(function(d){
//        return d.column == xyz;
//})
