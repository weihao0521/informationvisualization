var draw = function (party) {
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // draw plot
    d3.csv("./data/2016_" + party + ".csv", function (error, data) {
        if (error) throw error;

        data.forEach(function (d) {// process data
            d.date = parseDate(d.Date);
            for (var key in candidates[party]) {
                d[candidates[party][key]] = +d[candidates[party][key]];
            }
        });

        // set axis range
        x.domain(d3.extent(data, function (d) {
            return d.date;
        }));
        y.domain([0, d3.max(data, function (d) {
            var arg = [];
            for (var key in candidates[party]) {
                arg.push(d[candidates[party][key]]);
            }
            return Math.max.apply(this, arg);
        })]);

        // draw axis
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
            .text("poll (%)");

        // draw plot lines
        for (var key in candidates[party]) {
            // generate data for plot line
            var pathData = [];
            for (var dataIndex in data) {
                var d = data[dataIndex];
                if (!isNaN(d[candidates[party][key]])) {
                    pathData.push({
                        date: d.date,
                        poll: d[candidates[party][key]]
                    })
                }
            }

            // draw line
            var gLine = svg.append("g")
                .datum(pathData)
                .attr("class", "line")
                .attr("name", candidates[party][key]);
            gLine.append("path")
                .attr("class", "line_path")
                .attr("d", line)
                .attr("stroke", color(+key));
            /*gLine.selectAll(".circle").data(pathData)
             .enter().append("circle")
             .attr("r", 3)
             .attr("cx", function (d) {
             return x(new Date(d.date));
             })
             .attr("cy", function (d) {
             return height - margin.top - margin.bottom - (height - margin.top - margin.bottom - y(d.poll));
             })
             .attr("fill", color(+key));*/
        }
    });

    // draw event lines
    d3.csv("./data/2016_poll_" + party + ".csv", function (error, data) {
        var gEvent = svg.append("g").attr("class", "event");
    });
};
var bindEvent = function () {
    $("svg").on("mouseenter", ".line", function (e) {
        $("#mouseTip").css("display", "inline-block").css("left", e.clientX + 3).css("top", e.clientY);
        $("#mouseTipName").text($(this).attr("name"));
    }).on("mouseleave", ".line", function () {
        $("#mouseTip").css("display", "none");
    });
};
var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
var line = d3.svg.line()
    .x(function (d) {
        return x(d.date);
    })
    .y(function (d) {
        return y(d.poll);
    });

var color = d3.scale.category20();
var parseDate = d3.time.format("%m/%_d/%Y").parse;

var x = d3.time.scale()
    .range([0, width]);
var y = d3.scale.linear()
    .range([height, 0]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var candidates = {
    dem: ["MoE", "Clinton", "Sanders", "O'Malley"],
    rep: ["Trump", "Carson", "Rubio", "Cruz", "Bush", "Paul", "Kasich", "Fiorina", "Huckabee", "Christie", "Jindal", "Santorum", "Pataki", "Graham"]
};

draw("rep");
draw("dem");
bindEvent();