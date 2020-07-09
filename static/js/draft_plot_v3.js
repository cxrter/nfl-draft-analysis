// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 60, left: 50},
    height = 700 - margin.top - margin.bottom;

var bb = document.querySelector ('#my_viz')
                 .getBoundingClientRect(),
    width = bb.right - bb.left;
    console.log(width)

function responsivefy(svg) {
      // get container + svg aspect ratio
      var container = d3.select(svg.node().parentNode),
          width = parseInt(svg.style("width")),
          height = parseInt(svg.style("height")),
          aspect = width / height;

      // add viewBox and preserveAspectRatio properties,
      // and call resize so that svg resizes on inital page load
      svg.attr("viewBox", "0 0 " + width + " " + height)
          .attr("preserveAspectRatio", "xMinYMid")
          .call(resize);

      // to register multiple listeners for same event type,
      // you need to add namespace, i.e., 'click.foo'
      // necessary if you call invoke this function for multiple svgs
      // api docs: https://github.com/mbostock/d3/wiki/Selections#on
      d3.select(window).on("resize." + container.attr("id"), resize);

      // get width of container and resize svg to fit it
      function resize() {
          var targetWidth = parseInt(container.style("width"));
          svg.attr("width", targetWidth);
          svg.attr("height", Math.round(targetWidth / aspect));
      }
    }

// append the svg object to the body of the page
var svg = d3.select("#my_viz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .call(responsivefy)
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
d3.csv("/nfl-draft-analysis/pfr_draft_data.csv", function(data) {

// filter only positive scores, there's a few negatives
var data = data.filter(function(d){
        return d.draft_av >= parseInt('0');
})

// filter only players who have been a starter for the team
var data = data.filter(function(d){
        return d.years_with_team >= parseInt('1');
})


function get_color(team) {
var new_data = data.filter(function(d){
        return d.modern_code == team;
})
return new_data[0].color_primary;
}


var allTeams = (d3.map(data, function(d){return(d.modern_code)}).keys()).sort()
var allPositions = (d3.map(data, function(d){return(d.pos)}).keys()).sort()


var team_button_html = ''
for (i in allTeams){
    if (i == 0){  // initiate with ARI selected
        new_button = "<label class='btn btn-secondary active btn-xs "+allTeams[i]+" btn-"+allTeams[i]+"'><input type='checkbox' checked data-toggle='button' class='team_checkbox' value='"+allTeams[i]+"'>" + allTeams[i] + "</label><style>.btn-"+allTeams[i]+".active {background-color: "+get_color(allTeams[i])+" !important;}</style>"}
    else{
    new_button = "<label class='btn btn-secondary btn-xs "+allTeams[i]+" btn-"+allTeams[i]+"'><input type='checkbox' data-toggle='button' class='team_checkbox' value='"+allTeams[i]+"'>" + allTeams[i] + "</label><style>.btn-"+allTeams[i]+".active {background-color: "+get_color(allTeams[i])+" !important;}</style>"}
    team_button_html = team_button_html.concat(new_button)
}
document.getElementById("team_buttons").innerHTML = team_button_html;

squads = ['All', 'Offense', 'Defense', 'Special', 'Custom']
var squad_button_html = ''
for (i in squads){
    if (i == 0){  // initiate with All selected
    new_button = "<label class='btn btn-secondary active btn-xs btn-b " + squads[i] + "'><input type='radio' checked name='squads' id='1' data-toggle='button' class='squad_checkbox' value='"+squads[i]+"'><span>" + squads[i] + "</span></label><style>."+squads[i]+".active {background-color:#003a74!important;}</style>"}
    else{
    new_button = "<label class='btn btn-secondary btn-xs btn-b " + squads[i] + "'><input type='radio' name='squads' id='1' data-toggle='button' class='squad_checkbox' value='"+squads[i]+"'><span>" + squads[i] + "</span></label><style>."+squads[i]+".active {background-color:#003a74!important;}</style>"}
    squad_button_html = squad_button_html.concat(new_button)
}
document.getElementById("squad_buttons").innerHTML = squad_button_html;


var pos_button_html = ''
for (i in allPositions){
    new_button = "<label class='btn btn-secondary btn-xs " + allPositions[i] +"'><input type='checkbox' data-toggle='button' class='positions_checkbox check_" + allPositions[i] + " ' value='"+allPositions[i]+"'>" + allPositions[i] + "</label><style>."+allPositions[i]+".active {background-color:#4595d1!important;}</style>"
    // add <style>.btn-c.active {background-color:green!important;}</style> to change color
    pos_button_html = pos_button_html.concat(new_button)
}
document.getElementById("position_buttons").innerHTML = pos_button_html;



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
    .domain([0,d3.max(data, function(d) { return parseInt(d.draft_av)/parseInt(d.years_with_team); })])
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
  var tooltip = d3.select("#my_viz")
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
      .style("left", (d3.mouse(this)[0]+40) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
      .style("top", (d3.mouse(this)[1]+20) + "px")
  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style("opacity", 0)
  }



function update_chart() {

pos_list = []
      // For each squad radio button:
      d3.selectAll(".squad_checkbox").each(function(d){
        cb = d3.select(this);
        pos = cb.property("value")

        // If the box is check, I show the group
        if(cb.property("checked")){
        pos_list.push(String(pos))
        }
          })

      // For each position button:
      d3.selectAll(".positions_checkbox").each(function(d){
        cb = d3.select(this);
        pos = cb.property("value")

        // If the box is check, I show the group
        if(cb.property("checked")){
        pos_list.push(String(pos))
        }
          })


if (pos_list.includes('All')){
var data_t = data}
else if (pos_list.includes('Offense')){var data_t = data.filter(function(d){
        return d.squad == 'offense';})}
else if (pos_list.includes('Defense')){var data_t = data.filter(function(d){
        return d.squad == 'defense';})}
else if (pos_list.includes('Special')){var data_t = data.filter(function(d){
        return d.squad == 'special';})}

else{var data_t = data.filter(function(d){
        return (pos_list.indexOf(d.pos) != -1);})}


x
    .domain([0, d3.max(data, function(d) { return parseInt(d.draft_pick); })])
xAxis
    .transition()
    .duration(1000)
    .call(d3.axisBottom(x).tickSize(-height*1.3).ticks(6).tickPadding(15))

y
    .domain([0,d3.max(data, function(d) { return parseInt(d.draft_av)/parseInt(d.years_with_team); })])
yAxis
    .transition()
    .duration(1000)
    .call(d3.axisLeft(y).tickSize(-width*1.3).ticks(7))

    // Update our circles
    var circles = svg.selectAll("circle")
        .data(data_t);

    circles.exit().remove()

    circles
      .attr("class", function (d) { return "dot " + d.pos + " " + d.modern_code} )
      .attr("cx", function (d) { return x(d.draft_pick); } )
      .attr("cy", function (d) { return y(d.draft_av/d.years_with_team); } )
      .attr("r", 4)
      .style("stroke-width", 0)
      .style("fill", 'lightgrey')

    circles.enter()
        .append("circle")
      .attr("class", function (d) { return "dot " + d.pos + " " + d.modern_code} )
      .attr("cx", function (d) { return x(d.draft_pick); } )
      .attr("cy", function (d) { return y(d.draft_av/d.years_with_team); } )
      .attr("r", 4)
      .style("stroke-width", 0)
      .style("fill", 'lightgrey')
      .on("mouseover", mouseover)
      .on("mousemove", mousemove )
      .on("mouseleave", mouseleave );

      d3.selectAll(".team_checkbox").each(function(d){
        cb = d3.select(this);
        team = cb.property("value")

        // If the box is check, I show the group
        if(cb.property("checked")){
          svg.selectAll("." + CSS.escape(team))
          .raise()
          .transition().duration(1000)
          .attr("r", 7)
          .style("fill", function(d) { return d.color_primary} )
          .style("stroke-width", 1)
          .style("stroke", function(d) { return d.color_secondary})}
          })
}


function update_highlight() {

      // For each check box:
      d3.selectAll(".team_checkbox").each(function(d){
        cb = d3.select(this);
        team = cb.property("value")

        // If the box is check, I show the group
        if(cb.property("checked")){
          svg.selectAll("." + CSS.escape(team))
          .raise()
          .transition().duration(1000)
          .attr("r", 7)
          .style("fill", function(d) { return d.color_primary} )
          .style("stroke-width", 1)
          .style("stroke", function(d) { return d.color_secondary} )

          }

         // Otherwise mute it
        else{
        svg.selectAll("." + CSS.escape(team)).transition().duration(1000).attr("r", 4).style("fill", 'lightgrey').style("stroke-width", 0)
        }
      })}



// When team selection changes, update highlights
d3.selectAll(".team_checkbox").on("change", function(d) {
    update_highlight()
});


// Handle Squad selections (radio buttons)
d3.selectAll("#squad_buttons").on("click", function(d) {  // when a radio button selected

    for (i in allPositions){  // for each position checkbox
    if ($("."+allPositions[i]).hasClass('active')){  // if the checkbox is checked
    $("."+allPositions[i]).button("toggle")  // untoggle it
    $(".positions_checkbox").prop('checked', false);  // and uncheck it
    }
    }

    if ($(".Custom").hasClass('active')){  // if custom radio is selected
    $("."+allPositions[0]).button("toggle")  // toggle first position button
    $(".check_"+allPositions[0]).prop('checked', true); // and check first button (so data not blank)
    $(".Custom span").html('Custom')
    }

    update_chart()

});


// When a checkbox selected, toggle custom and run update on checked boxes
d3.selectAll(".positions_checkbox").on("change", function(d) {
    if (! $(".Custom").hasClass('active')){
    $(".Custom").button("toggle")}
    $(".Custom span").html('Reset')
    update_chart()
});


// handle resetting team highlighting
d3.selectAll(".reset-button").on('click', function(d){
    for (i in allTeams){  // for each team checkbox
    if ($("."+allTeams[i]).hasClass('active')){  // if the checkbox is checked
    $("."+allTeams[i]).button("toggle") // untoggle it
    $(".team_checkbox").prop('checked', false)  // and uncheck it
    $("."+allTeams[i]).removeClass('active')
    }
    }
    update_highlight()
    })


// initiate
update_chart()

})



// filtering data
//var filtered_data = data.filter(function(d){
//        return d.column == xyz;
//})
