function dashboard(id, fData){
    var barColor = 'steelblue';
    var barColor2 = 'green';
        
    // function segColor(c){ return {imp_seen:"#807dba", imp_paid:"#e08214",passbacks:"#41ab5d"}[c]; }
    // function segColor(c){ return {total:"#e08214", passbacks:"#41ab5d"}[c]; }
    function segColor(c){ return {imp_paid:"#e08214", passbacks:"#41ab5d"}[c]; }
    
    // compute total for each state.
    // fData.forEach(function(d){d.total=d.freq.low+d.freq.mid+d.freq.high;});
    // fData.forEach(function(d){d.total=d.freq.imp_paid+d.freq.passbacks;});
    
    // function to handle histogram.
    function histoGram(fD){
        var hG={},    hGDim = {t: 60, r: 0, b: 30, l: 0};
        hGDim.w = 600 - hGDim.l - hGDim.r, 
        hGDim.h = 300 - hGDim.t - hGDim.b;
            
        //create svg for histogram.
        var hGsvg = d3.select(id).append("svg")
            .attr("width", hGDim.w + hGDim.l + hGDim.r)
            .attr("height", hGDim.h + hGDim.t + hGDim.b).append("g")
            .attr("transform", "translate(" + hGDim.l + "," + hGDim.t + ")");

        // create function for x-axis mapping.
        var x = d3.scale.ordinal().rangeRoundBands([0, hGDim.w], 0.1)
                .domain(fD.map(function(d) { return d[0]; }));

        // Add x-axis to the histogram svg.
        hGsvg.append("g").attr("class", "x axis")
            .attr("transform", "translate(0," + hGDim.h + ")")
            .call(d3.svg.axis().scale(x).orient("bottom"));

        // Create function for y-axis map.
        var y = d3.scale.linear().range([hGDim.h, 0])
                .domain([0, d3.max(fD, function(d) { return d[1]; })]);

        // Create bars for histogram to contain rectangles and freq labels.
        var bars = hGsvg.selectAll(".bar").data(fD).enter()
                .append("g").attr("class", "bar");
        
        colors = d3.scale.category20()

        //create the rectangles.
        bars.append("rect")
            .attr("x", function(d) { return x(d[0]); })
            .attr("y", function(d) { return y(d[1]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d) { return hGDim.h - y(d[1]); })
            // .attr('fill', barColor)
            .attr("fill",function(d,i){return colors(i%2)})
            .on("mouseover",mouseover)// mouseover is defined below.
            .on("mouseout",mouseout);// mouseout is defined below.
            
        //Create the frequency labels above the rectangles.
        bars.append("text").text(function(d){ return d3.format(",")(d[1])})
            .attr("x", function(d) { return x(d[0])+x.rangeBand()/2; })
            .attr("y", function(d) { return y(d[1])-5; })
            .attr("text-anchor", "middle")
        

        function mouseover(d){  // utility function to be called on mouseover.
            // filter for selected state.
            var st = fData.filter(function(s){ return s.DemandPartner == d[0];})[0],
                nD = d3.keys(st.freq).map(function(s){ return {type:s, freq:st.freq[s]};});
               
            // call update functions of pie-chart and legend.    
            pC.update(nD);
            leg.update(nD);
        }
        
        function mouseout(d){    // utility function to be called on mouseout.
            // reset the pie-chart and legend.    
            pC.update(tF);
            leg.update(tF);
        }
        
        // create function to update the bars. This will be used by pie-chart.
        hG.update = function(nD, color){
            // update the domain of the y-axis map to reflect change in frequencies.
            y.domain([0, d3.max(nD, function(d) { return d[1]; })]);
            
            // Attach the new data to the bars.
            var bars = hGsvg.selectAll(".bar").data(nD);
            
            // transition the height and color of rectangles.
            bars.select("rect").transition().duration(500)
                .attr("y", function(d) {return y(d[1]); })
                .attr("height", function(d) { return hGDim.h - y(d[1]); })
                .attr("fill", color);

            // transition the frequency labels location and change value.
            bars.select("text").transition().duration(500)
                .text(function(d){ return d3.format(",")(d[1])})
                .attr("y", function(d) {return y(d[1])-5; });            
        }        
        return hG;
    }
    
    // function to handle pieChart.
    function pieChart(pD){
        var pC ={},    pieDim ={w:250, h: 250};
        pieDim.r = Math.min(pieDim.w, pieDim.h) / 2;
                
        // create svg for pie chart.
        var piesvg = d3.select(id).append("svg")
            .attr("width", pieDim.w).attr("height", pieDim.h).append("g")
            .attr("transform", "translate("+pieDim.w/2+","+pieDim.h/2+")");
        
        // create function to draw the arcs of the pie slices.
        var arc = d3.svg.arc().outerRadius(pieDim.r - 10).innerRadius(0);

        // create a function to compute the pie slice angles.
        var pie = d3.layout.pie().sort(null).value(function(d) { return d.freq; });

        // Draw the pie slices.
        piesvg.selectAll("path").data(pie(pD)).enter().append("path").attr("d", arc)
            .each(function(d) { this._current = d; })
            .style("fill", function(d) { return segColor(d.data.type); })
            .on("mouseover",mouseover).on("mouseout",mouseout);

        // create function to update pie-chart. This will be used by histogram.
        pC.update = function(nD){
            piesvg.selectAll("path").data(pie(nD)).transition().duration(500)
                .attrTween("d", arcTween);
        }        
        // Utility function to be called on mouseover a pie slice.
        function mouseover(d){
            // call the update function of histogram with new data.
            hG.update(fData.map(function(v){ 
                return [v.DemandPartner,v.freq[d.data.type]];}),segColor(d.data.type));
        }
        //Utility function to be called on mouseout a pie slice.
        function mouseout(d){
            // call the update function of histogram with all data.
            hG.update(fData.map(function(v){
                return [v.DemandPartner,v.total];}), barColor);
        }
        // Animating the pie-slice requiring a custom function which specifies
        // how the intermediate paths should be drawn.
        function arcTween(a) {
            var i = d3.interpolate(this._current, a);
            this._current = i(0);
            return function(t) { return arc(i(t));    };
        }    
        return pC;
    }
    
    // function to handle legend.
    function legend(lD){
        var leg = {};
            
        // create table for legend.
        var legend = d3.select(id).append("table").attr('class','legend');
        
        // create one row per segment.
        var tr = legend.append("tbody").selectAll("tr").data(lD).enter().append("tr");
            
        // create the first column for each segment.
        tr.append("td").append("svg").attr("width", '16').attr("height", '16').append("rect")
            .attr("width", '16').attr("height", '16')
            .attr("fill",function(d){ return segColor(d.type); });
            
        // create the second column for each segment.
        tr.append("td").text(function(d){ return d.type;});

        // create the third column for each segment.
        tr.append("td").attr("class",'legendFreq')
            .text(function(d){ return d3.format(",")(d.freq);});

        // create the fourth column for each segment.
        tr.append("td").attr("class",'legendPerc')
            .text(function(d){ return getLegend(d,lD);});

        // Utility function to be used to update the legend.
        leg.update = function(nD){
            // update the data attached to the row elements.
            var l = legend.select("tbody").selectAll("tr").data(nD);

            // update the frequencies.
            l.select(".legendFreq").text(function(d){ return d3.format(",")(d.freq);});

            // update the percentage column.
            l.select(".legendPerc").text(function(d){ return getLegend(d,nD);});        
        }
        
        function getLegend(d,aD){ // Utility function to compute percentage.
            return d3.format("%")(d.freq/d3.sum(aD.map(function(v){ return v.freq; })));
        }

        return leg;
    }
    
    // calculate total frequency by segment for all state.
    // var tF = ['low','mid','high'].map(function(d){ 
    //     return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
    // });
    var tF = ['passbacks', 'imp_paid'].map(function(d){ 
        return {type:d, freq: d3.sum(fData.map(function(t){ return t.freq[d];}))}; 
    });
    
    // calculate total frequency by state for all segment.
    var sF = fData.map(function(d){return [d.DemandPartner,d.total];});

    var hG = histoGram(sF), // create the histogram.
        pC = pieChart(tF), // create the pie-chart.
        leg= legend(tF);  // create the legend.
}

var freqData=[
    {DemandPartner:'ADX',          total: 864594,  freq: { passbacks: 586084 }},
    {DemandPartner:'t-ADX',        total: 889011,  freq: { passbacks: 562880 }},
    {DemandPartner:'AOL',          total: 558212,  freq: { passbacks: 492149 }},
    {DemandPartner:'t-AOL',        total: 562880,  freq: { passbacks: 428838 }},
    {DemandPartner:'PulsePoint',   total: 464362,  freq: { passbacks: 444236 }},
    {DemandPartner:'t-PulsePoint', total: 428838,  freq: { passbacks: 396177 }},
    {DemandPartner:'Conversant',   total: 416775,  freq: { passbacks: 405442 }},
    {DemandPartner:'t-Conversant', total: 396177,  freq: { passbacks: 372129 }},
    {DemandPartner:'Pubmatic',     total: 39382,   freq: { passbacks: 19698  }},
    {DemandPartner:'t-Pubmatic',   total: 372129,  freq: { passbacks: 323221 }},
    {DemandPartner:'Smaato',       total: 250457,  freq: { passbacks: 108560 }},
    {DemandPartner:'t-Smaato',     total: 323221,  freq: { passbacks: 123080 }}
];

// var tdata = [
//     {imp_seen: 864594,  passbacks: 586084 },
//     {imp_seen: 889011,  passbacks: 562880 },
//     {imp_seen: 558212,  passbacks: 492149 },
//     {imp_seen: 562880,  passbacks: 428838 },
//     {imp_seen: 464362,  passbacks: 444236 },
//     {imp_seen: 428838,  passbacks: 396177 },
//     {imp_seen: 416775,  passbacks: 405442 },
//     {imp_seen: 396177,  passbacks: 372129 },
//     {imp_seen: 39382 ,  passbacks: 19698  },
//     {imp_seen: 372129,  passbacks: 323221 },
//     {imp_seen: 250457,  passbacks: 108560 },
//     {imp_seen: 323221,  passbacks: 123080 }
// ]

freqData.forEach(function(row){
    row.freq.imp_paid=row.total-row.freq.passbacks;
    // row.freq.total=row.freq.total-row.freq.passbacks;
});

dashboard('#dashboard',freqData);