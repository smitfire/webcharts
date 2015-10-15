(function(){
  var margin = {top: 100, right: 80, bottom: 30, left: 50},
      width = 1060 - margin.left - margin.right,
      height = 600 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y-%m-%d").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var color = d3.scale.category10();

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .tickSize(-width)
      .orient("left");

  var line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.temperature); });

  var svg = d3.select("#pml").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  d3.csv("0_partner_norm.csv", function(error, data) {
    if (error) throw error;
    
    console.log("first data fetch");
    
    color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Date"; }));

    data.forEach(function(d) {
      d.date = parseDate(d.Date);
    });

    var cities = color.domain().map(function(name) {
      return {
        name: name,
        values: data.map(function(d) {
          return {date: d.date, temperature: +d[name]};
        })
      };
    });

    // x.domain([data[0].date, data[data.length - 1].date]);
    x.domain(d3.extent(data, function(d) { return d.date; }));

    y.domain([
      d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
      d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
    ]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -20)
        .attr("dy", -4)
        .style("text-anchor", "end")
        .text("Inbound Discpepancy");

    var city = svg.selectAll(".city")
        .data(cities)
      .enter().append("g")
        .attr("class", "city");

    city.append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .style("stroke", function(d) { return color(d.name); });

    city.append("text")
        .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
        .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
        .attr("x", -70)
        .attr("dy", ".55em")
        .attr("class", "label")
        .text(function(d) { return d.name; });

    var legend = svg.selectAll(".legend")
          .data(cities)
        .enter().append("g")
          .attr("class", "legend")
          // .attr("transform", function(d, i) { return "translate(" + (i*0.44) * -500 + ",-60)"; });
          .attr("transform", function(d, i) { return "translate(" + (i*0.5) * -350 + ",-60)"; });

      legend.append("rect")
          .attr("x", width+25)
          .attr("width", 20)
          .attr("height", 20)
          .style("fill", function(d) { return color(d.name); });

      legend.append("text")
          .attr("x", width + 15)
          .attr("y", 9)
          .attr("dy", ".45em")
          .style("text-anchor", "end")
          .text(function(d) { return d.name; });
  });

  function changeData(){
      var fstr = this.value + "_partner_norm.csv"
      d3.csv(fstr, function(error, data) { 
          if (error) throw error;
          
          color.domain(d3.keys(data[0]).filter(function(key) { return key !== "Date"; }));

          data.forEach(function(d) {
            d.date = parseDate(d.Date);
          });

          var cities = color.domain().map(function(name) {
            return {
              name: name,
              values: data.map(function(d) {
                return {date: d.date, temperature: +d[name]};
              })
            };
          });
          // y.domain([-5,5]);
          y.domain([
            d3.min(cities, function(c) { return d3.min(c.values, function(v) { return v.temperature; }); }),
            d3.max(cities, function(c) { return d3.max(c.values, function(v) { return v.temperature; }); })
          ]);

          var svg = d3.select("#pml");
          var city = svg.selectAll(".city")
              .data(cities);

          // console.log(city)

          city.select(".line")
              .transition()
              .duration(600)
              .attr("d", function(d) { console.log(d.values); return line(d.values); });
          
          city.select(".label")
              .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
              .transition()
              .duration(600)
              .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")"; })
              .attr("x", 3)
              .attr("dy", ".35em")
              .text(function(d) { return d.name; });

          svg.select(".y.axis").call(yAxis);

      });
  }

  d3.selectAll("#pml input").on("change", changeData);
})();
