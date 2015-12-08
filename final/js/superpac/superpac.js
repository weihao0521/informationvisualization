(function () {
    var barColor = {
        dem: ["#98abc5", "#8a89a6", "#7b6888"],
        rep: ["#a05d56", "#d0743c", "#ff8c00"]
    };

    var margin = {top: 20, right: 20, bottom: 30, left: 50};
    var width = (window.innerWidth - 20) / 2 - margin.left - margin.right;
    var height = 500 - margin.top - margin.bottom;

    var x0 = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var x1 = d3.scale.ordinal();

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickFormat(d3.format(".2s"));

    var draw = function (party) {
        var svg = d3.select("body").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var color = d3.scale.ordinal()
            .range(barColor[party]);

        d3.csv("../../data/SuperPAC/" + party + "SuperPAC.csv", function (error, data) {
            if (error) throw error;

            var ageNames = d3.keys(data[0]).filter(function (key) {
                return key !== "Candidate";
            });

            data.forEach(function (d) {
                d.ages = ageNames.map(function (name) {
                    return {name: name, value: +d[name]};
                });
            });

            x0.domain(data.map(function (d) {
                return d.Candidate;
            }));
            x1.domain(ageNames).rangeRoundBands([0, x0.rangeBand()]);
            y.domain([0, d3.max(data, function (d) {
                return d3.max(d.ages, function (d) {
                    return d.value;
                });
            }) + (party == "dem" ? 30000000 : 10000000)]);

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
                .text("U.S. Dollar");

            svg.append("line")
                .attr("class", "cap line")
                .attr("x1", 0)
                .attr("x2", width)
                .attr("y1", function () {
                    return party == "dem" ? y(88394187.55) : y(32605827.32);
                })
                .attr("y2", function () {
                    return party == "dem" ? y(88394187.55) : y(32605827.32);
                })
                .style("stroke", function () {
                    return party == "dem" ? "rgb(25, 19, 191)" : "rgb(159, 11, 11)";
                })
                .attr("stroke-width", 3);

            svg.append("text")
                .attr("class", "cap text")
                .attr("transform", function () {
                    return party == "dem" ? "translate(" + (width - 220) + "," + y(90717000) + ")" : "translate(" + (width - 220) + "," + y(33717000) + ")";
                })
                .attr("dy", ".35em")
                .attr("text-anchor", "start")
                .style("fill", "steelblue")
                .text("Obama Raises On Certain Time of Last Campaign");

            svg.append("line")
                .attr("x1", 0.8)
                .attr("x2", width - 45)
                .attr("y1", height)
                .attr("y2", height)
                .style("stroke", "black")
                .attr("stroke-width", 1)

            var candidate = svg.selectAll(".candidate")
                .data(data)
                .enter().append("a")
                .attr("class", "group")
                .attr("xlink:href", function (d) {
                    return "./personal.html?candidate=" + d.Candidate.split(" ")[1];
                })
                .attr("candidate", function (d) {
                    return d.Candidate;
                })
                .attr("transform", function (d) {
                    return "translate(" + x0(d.Candidate) + ",0)";
                });

            candidate.selectAll("rect")
                .data(function (d) {
                    return d.ages;
                })
                .enter().append("rect")
                .attr("width", x1.rangeBand())
                .attr("x", function (d) {
                    return x1(d.name);
                })
                .attr("y", function (d) {
                    return y(d.value);
                })
                .attr("height", function (d) {
                    return height - y(d.value);
                })
                .style("fill", function (d) {
                    return color(d.name);
                });

            var legend = svg.selectAll(".legend")
                .data(ageNames.slice().reverse())
                .enter().append("g")
                .attr("class", "legend")
                .attr("transform", function (d, i) {
                    return "translate(0," + i * 20 + ")";
                });

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function (d) {
                    return d;
                });

        });
    };
    draw("dem");
    draw("rep");
})();