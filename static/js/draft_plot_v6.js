// set the dimensions and margins of the graph
var margin = {top: 20, right: 60, bottom: 50, left: 40},
    scatter_height = 400 - margin.top - margin.bottom
    scatter_width = 800 - margin.left - margin.right;

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
var scatter_svg = d3.select("#my_viz")
  .append("svg")
    .attr("width", scatter_width + margin.left + margin.right)
    .attr("height", scatter_height + margin.top + margin.bottom)
    .call(responsivefy)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")


//Read the data
//d3.csv("../pfr_draft_data.csv", function(data) {
d3.csv("pfr_draft_data.csv", function(data) {

var colors = ['7AC74F', 'BD93BD', '3F88C5', 'F9C80E']
var highlight_list = ['ARI'];
var color_map = [{'team':'ARI', 'color':'DB222A'}];


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
        new_button = "<label class='btn btn-secondary active btn-xs "+allTeams[i]+" btn-"+allTeams[i]+"'><input type='checkbox' checked data-toggle='button' class='team_checkbox' value='"+allTeams[i]+"'>" + allTeams[i] + "</label>"}
    else{
    new_button = "<label class='btn btn-secondary btn-xs "+allTeams[i]+" btn-"+allTeams[i]+"'><input type='checkbox' data-toggle='button' class='team_checkbox' value='"+allTeams[i]+"'>" + allTeams[i] + "</label>"} //<style>.btn-"+allTeams[i]+".active {background-color: "+get_color(allTeams[i])+" !important;}</style>
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
    .range([ 0, scatter_width ])
    .domain([0, d3.max(data, function(d) { return parseInt(d.draft_pick); })])
  var xAxis = scatter_svg.append("g")
    .attr("transform", "translate(0," + scatter_height*1.05 + ")")
    .attr("class", "axis")
    .style('font-size', '0.6vw')
    .attr("stroke-dasharray", "1,1")
    .call(d3.axisBottom(x).tickSize(-scatter_height*1.05).tickValues([0,32,64,102,138,173,214,254]).tickPadding(20).tickFormat(''))
    .select(".domain").remove()


  // Initialise Y axis
  var y = d3.scaleLinear()
    .range([ scatter_height, 0])
    .domain([0,d3.max(data, function(d) { return parseInt(d.draft_av)/parseInt(d.years_with_team); })])
  var yAxis = scatter_svg.append("g")
    .attr("class", "axis")
    .style('font-size', '0.6vw')
    .attr('transform', 'translate(-15,0)')
    .call(d3.axisLeft(y).tickSize(-scatter_width-15).ticks(6).tickPadding(10).tickFormat(''))
    //.call(d3.axisLeft(y).tickSize(-scatter_width-15).ticks(5).tickPadding(10))
    .attr("stroke-dasharray", "1,1")
    .select(".domain").remove()

 // Add X axis label:
  scatter_svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", scatter_width/2)
      .attr("y", scatter_height + 40)
      .style('font-size', '0.8em')
      .style('fill', 'grey')
      .text("Draft Position");

  // Y axis label:
  scatter_svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("y", -20)
      .attr("x", - scatter_height/2)
      .style('font-size', '0.8em')
      .style('fill', 'grey')
      .text("Approximate Value")


    // Customization
  scatter_svg.selectAll(".tick line").attr("stroke", "grey").style('opacity',0.1)

  // Add upper label
  var hover_label = scatter_svg.append('text')
    .attr("transform",  "translate("+scatter_width+",25)")
    .attr('text-anchor', 'end')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'white')
    .style('font-size', '0.7em')
    .text('Hover to see player details');

  // Add Rd 1 label
  var rd1_line = scatter_svg
    .append('path')
    .attr('d', d3.line()([[x(0),scatter_height+15], [x(0),scatter_height+25], [x(32),scatter_height+25], [x(32),scatter_height+15]]))
    .attr('stroke', 'grey')
    .attr('fill', 'none');

  // Add Rd labels
  rds = [64,102,138,173,214,254]
  for (rd in rds){
  scatter_svg.append('path')
    .attr('d', d3.line()([[x(rds[rd]),scatter_height+15], [x(rds[rd]),scatter_height+20]]))
    .attr('stroke', 'grey')
    .attr('fill', 'none');}


  var rd1_line = scatter_svg
    .append('path')
    .attr('d', d3.line()([[x(0),scatter_height+15], [x(0),scatter_height+25], [x(32),scatter_height+25], [x(32),scatter_height+15]]))
    .attr('stroke', 'grey')
    .attr('fill', 'none');

  // Add upper label
  var rd1_label = scatter_svg.append('text')
    .attr('class', 'ytext')
    .attr("transform",  "translate("+x(16)+","+(scatter_height+25)+")")
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('fill', 'grey')
    .style('font-size', '0.7em')
    .text('First Round');

  // Add background rect to text
var rect_rd1_label = rd1_label.node().getBBox();
    upper_rect = scatter_svg.append('rect')
    .attr("transform",  "translate("+x(16)+","+(scatter_height+25)+")")
    .attr("x", rect_rd1_label.x -5)
    .attr("y", rect_rd1_label.y)
    .attr("width", rect_rd1_label.width + 10)
    .attr("height", rect_rd1_label.height)
    .style('fill', '#242630')
d3.selectAll('.ytext').raise()



var pickar = [32,64,102,138,173,214,254]
    var path_data = []
    for (i in pickar){
    if (i==0){var filterd = data.filter(function(d){return d.draft_pick <= pickar[i];})}
    else{var filterd = data.filter(function(d){return d.draft_pick <= pickar[i] && d.draft_pick > pickar[i-1];})}
    var filtered_sorted = filterd
        .map(d => d.draft_av/d.years_with_team)
        .filter(d => d !== null && !isNaN(d))
        .sort(d3.ascending);
    var i_quant = (d3.quantile(filtered_sorted, 0.95))
    if (i==0){path_data.push({"x":x(pickar[i]-32), "y":y(i_quant)})}
    if (i==6){path_data.push({"x":(scatter_width), "y":y(i_quant)})}
    else {path_data.push({"x":x(pickar[i]-16), "y":y(i_quant)})}}

var lineFunction = d3.line()
      .curve(d3.curveBasis)
     .x(function(d) { return d.x; })
     .y(function(d) { return d.y; })


  var quant_path = scatter_svg
    .append('path')
    .style("stroke-dasharray", ("6, 6"))
    .attr('d', lineFunction(path_data))
    .attr('id', 'q_path')
    //.attr('stroke', '#126638')
    .attr('stroke', 'white')
    .attr('fill', 'none');

// Add a text label.
var text = scatter_svg.append("text")
    .attr("x", scatter_width-40)
    .attr("dy", -5);

text.append("textPath")
    .attr("stroke","white")
    .style('font-family', 'Courier New')
    .style('font-weight', 'lighter')
    .style('font-size', '0.8em')
    .attr("xlink:href","#q_path")
    .text("Top 10%");


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
      d3.selectAll("." + CSS.escape(d.player.split(' ').join('').split('.').join('').split("'").join('')))
      .attr("r", 7)
      .style('opacity', 1)
      .style('stroke', 'white')
      .style('stroke-width', 1)

    tooltip
      .style("opacity", 1)
  }

  var mousemove = function(d) {
    var mouse = d3.mouse(d3.select('#my_viz').node()).map(function(d) {return parseInt(d); });
    tooltip
        .style("top", mouse[1] + "px")
        .style("left", (mouse[0] + 30) + "px")
      .html(d.player +', ' + d.pos + ', to the ' + d.short_name)

  }

  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  var mouseleave = function(d) {
    tooltip
      .transition()
      .duration(200)
      .style('opacity', 0)
      .style('pointer-events', 'none')

    update_highlight()

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

var upper_year = $( "#amount-high" ).val();
var lower_year = $( "#amount-low" ).val();
var data_t = data_t.filter(function(d){
        return d.draft_year >= lower_year && d.draft_year <= upper_year;})

    var path_data = []
    for (i in pickar){
    if (i==0){var filterd = data_t.filter(function(d){return d.draft_pick <= pickar[i];})}
    else{var filterd = data_t.filter(function(d){return d.draft_pick <= pickar[i] && d.draft_pick > pickar[i-1];})}
    var filtered_sorted = filterd
        .map(d => d.draft_av/d.years_with_team)
        .filter(d => d !== null && !isNaN(d))
        .sort(d3.ascending);
    var i_quant = (d3.quantile(filtered_sorted, 0.95))
    if (i==0){path_data.push({"x":x(pickar[i]-32), "y":y(i_quant)})}
    if (i==6){path_data.push({"x":(scatter_width), "y":y(i_quant)})}
    else {path_data.push({"x":x(pickar[i]-16), "y":y(i_quant)})}}


quant_path
    .attr('d', lineFunction(path_data))


// Update our circles
var circles = scatter_svg.selectAll("circle")
        .data(data_t);

    circles
      .attr("class", function (d) { return "dot " + d.pos + " " + d.modern_code + " " + CSS.escape(d.player.split(' ').join('').split('.').join('').split("'").join(''))} )
      .attr("cx", function (d) { return x(d.draft_pick); } )
      .attr("cy", function (d) { return y(d.draft_av/d.years_with_team); } )
      .attr("r", 4)
      .style('opacity', 0.1)
      .style("fill", 'e1e1e1')

    circles.enter()
        .append("circle")
      .attr("class", function (d) { return "dot " + d.pos + " " + d.modern_code + " " + d.pfr_player_code + " " + CSS.escape(d.player.split(' ').join('').split('.').join('').split("'").join(''))} )
      .attr("cx", function (d) { return x(d.draft_pick); } )
      .attr("cy", function (d) { return y(d.draft_av/d.years_with_team); } )
      .attr("r", 4)
      .style("fill", '#e1e1e1')
      .style('opacity', 0.1)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove )
      .on("mouseleave", mouseleave );

      circles.exit().remove()

      update_highlight()

quant_path
    .raise()
}


function update_highlight() {



      var n_checked = highlight_list.length

        for (i in allTeams){
        scatter_svg.selectAll("." + CSS.escape(allTeams[i])).attr("r", 4).style("fill", '#e1e1e1').style('opacity', 0.1).style("stroke-width", 0).style("stroke", 'grey');

        d3.select(".btn-"+allTeams[i])
           .style('background-color','#494d59')

        }

        // for i in highlight_list , scatter_svg.selectAll("." + CSS.escape(highlight_list[i])) raise color etc
        for (i in color_map){
        scatter_svg.selectAll("." + CSS.escape(color_map[i].team))
          .raise()
          .attr("r", 4)
          .style("stroke-width", 0)
          .style('opacity', 1)
          .style("fill", color_map[(i)%5].color)
          d3.select(".btn-"+color_map[i].team)
            .style('background-color', '#' + color_map[(i)%5].color)
        }

      }

var removeByAttr = function(arr, attr, value){
    var i = arr.length;
    while(i--){
       if( arr[i]
           && arr[i].hasOwnProperty(attr)
           && (arguments.length > 2 && arr[i][attr] === value ) ){

           arr.splice(i,1);

       }
    }
    return arr;
}

var n_checked = 0;
// When team selection changes, update highlights
d3.selectAll(".team_checkbox").on('change', function(d) {
// get the box that was just clicked. If it was highlighted, append it to list. Otherwise remove it from list.
cb = d3.select(this)
    if (cb.property("checked")){
    n_checked = n_checked + 1
    highlight_list.push(this.value)
    var obj = {}
    obj['team'] = this.value
    obj['color'] = colors[colors.length - 1]
    color_map.push(obj)
    colors.pop()
    }
    else {colors.push(color_map.filter(obj => {return obj.team === this.value})[0].color); color_map = removeByAttr(color_map, 'team', this.value);};



update_highlight()
});



// Handle Squad selections (radio buttons)
d3.selectAll(".squad_checkbox").on("click", function(d) {  // when a radio button selected
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
    // reset highlight list to empty
    highlight_list = [];
    color_map = [];
    colors = ['7AC74F', 'BD93BD', '3F88C5', 'F9C80E', 'DB222A']
    update_highlight()
    })


// handle slider change
  $( function() {
    $( "#slider-range" ).slider({
      range: true,
      min: 2010,
      max: 2020,
      values: [ 2012, 2018 ],
      slide: function( event, ui ) {
        $( "#amount-low" ).val(ui.values[ 0 ] );
        $( "#amount-high" ).val(ui.values[ 1 ]);
        update_chart()
      }

    });
    $( "#amount-high" ).val($( "#slider-range" ).slider( "values", 1 ) );
    $( "#amount-low" ).val($( "#slider-range" ).slider( "values", 0 ) );

  } );




// initiate
update_chart()

})



//// filtering data
//var filtered_data = data.filter(function(d){
//        return d.column == xyz;
//})

