(function(){

    var margin = {top: 20, right: 80, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var city = "Pulsepoint",
        parseDate = d3.time.format("%Y-%m-%d").parse;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .tickSize(-width)
        .orient("left");

    var color = d3.scale.category10();

    var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d[city]); });

    var svg = d3.select("#line").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.csv("intimedata_norm.csv", function(error, data) {
      if (error) throw error;

      data.forEach(function(d) {
        d.date = parseDate(d.Date);
        d["Pulsepoint"] = +d["Pulsepoint"];
        d["Pubmatic"] = +d["Pubmatic"];
        d["AdX"] = +d["AdX"];
        d["AOL"] = +d["AOL"];
        d["Conversant"] = +d["Conversant"];
        d["Smaato"] = +d["Smaato"];
      });

      // var cities = color.domain().map(function(name) {
      //   return {
      //     name: name,
      //     values: data.map(function(d) {
      //       return {date: d.date, temperature: +d[name]};
      //     })
      //   };
      // });

      x.domain([data[0].date, data[data.length - 1].date]);
      y.domain(d3.extent(data, function(d) { return d[city]; }));

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", ".71em")
          .style("text-anchor", "end")
          .text("Inbound Discpepancy");

      svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);

      svg.append("text")
          .datum(data[data.length - 1])
          .attr("class", "label")
          .attr("transform", transform)
          .attr("x", 3)
          .attr("dy", ".35em")
          .text(city);

      d3.selectAll("#line input").on("change", change);

      var timeout = setTimeout(function() {
        d3.select("input[value=\"Pubmatic\"]").property("checked", true).each(change);
      }, 2000);

      function change() {
        clearTimeout(timeout);

        city = this.value;

        // First transition the line & label to the new city.
        var t0 = svg.transition().duration(750);
        t0.selectAll(".line").attr("d", line);
        t0.selectAll(".label").attr("transform", transform).text(city);

        // Then transition the y-axis.
        y.domain(d3.extent(data, function(d) { return d[city]; }));
        var t1 = t0.transition();
        t1.selectAll(".line").attr("d", line);
        t1.selectAll(".label").attr("transform", transform);
        t1.selectAll(".y.axis").call(yAxis);
      }

      function transform(d) {
        return "translate(" + x(d.date) + "," + y(d[city]) + ")";
      }
    });
})();