var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = (window.innerWidth - 20) / 2 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var color = d3.scale.category20();

var x = d3.time.scale()
    .range([0, width]);
var y = d3.scale.linear()
    .range([height, 0]);
var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.month, 1)
    .tickFormat(d3.time.format("%B"));
var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

/*var candidates = {
 dem: ["MoE", "Clinton", "Sanders", "O'Malley"],
 rep: ["Trump", "Carson", "Rubio", "Cruz", "Bush", "Paul", "Kasich", "Fiorina", "Huckabee", "Christie", "Jindal", "Santorum", "Pataki", "Graham"]
 };*/
var candidates = {
    dem: ["Clinton", "Sanders"],
    rep: ["Trump", "Carson", "Rubio", "Cruz", "Bush"]
};// filter some candidates
var months = ["January", "February", "March", "April", "June", "July", "August", "September", "October", "November", "December"];
var draw = function (party) {
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", party + "_plot");

    // draw plot
    d3.csv("./data/poll/2016_poll_" + party + ".csv", function (error, data) {
        if (error) throw error;

        var dateParser = d3.time.format("%m/%_d/%Y").parse;
        var pathFn = d3.svg.line()
            .x(function (d) {
                return x(d.date);
            })
            .y(function (d) {
                return y(d.poll);
            });

        // filter data with Array.prototype.filter
        var baseDate = new Date(2015, 6, 1);// July 1, 2015
        data = data.filter(function (d) {
            return new Date(dateParser(d.date)) >= baseDate;
        });

        // process data
        data.forEach(function (d, i) {
            d.date = dateParser(d.date);
            for (var key in candidates[party]) {
                d[candidates[party][key]] = +d[candidates[party][key]];
            }
        });

        console.log(data);

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

        // draw plot paths
        for (var key in candidates[party]) {
            // generate data for plot path
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

            // draw path
            var gLine = svg.append("g")
                .datum(pathData)
                .attr("class", "path")
                .attr("name", candidates[party][key]);
            gLine.append("path")
                .attr("d", pathFn)
                .attr("stroke", color(+key));
            gLine.selectAll(".circle").data(pathData)
                .enter().append("circle")
                .attr("r", 3)
                .attr("cx", function (d) {
                    return x(new Date(d.date));
                })
                .attr("cy", function (d) {
                    return height - margin.top - margin.bottom - (height - margin.top - margin.bottom - y(d.poll));
                })
                .attr("fill", color(+key));
        }
    });

    // draw event lines
    d3.tsv("./data/event/" + party + "GroupEvent.tsv", function (error, data) {
        if (error) throw error;

        var dateParser = d3.time.format("%Y/%m/%_d").parse;

        data.forEach(function (d) {// process data
            d.date = dateParser(d.date);
        });

        var gEvent = svg.selectAll(".event")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "event")
            .attr("description", function (d) {
                return d.event;
            })
            .attr("date", function (d) {
                var date = new Date(d.date);
                var yyyy = date.getFullYear().toString();
                var mm = date.getMonth(); // getMonth() is zero-based
                var dd = date.getDate().toString();
                mm = months[mm];
                return mm + " " + dd + ", " + yyyy;
            });
        gEvent.append("line")
            .attr("class", "event_line")
            .attr("x1", function (d) {
                return parseInt(x(new Date(d.date)));
            })
            .attr("y1", 0)
            .attr("x2", function (d) {
                return parseInt(x(new Date(d.date)));
            })
            .attr("y2", height)
            .attr("stroke", "#000")
            .attr("stroke-width", "2px");
    });
};
var bindEvent = function () {
    $("svg").on("mouseenter", ".path", function (e) {
        $("#candidateTip").css("display", "block").css("left", e.clientX).css("top", e.clientY);
        $("#candidateTipName").text($(this).attr("name"));
    }).on("mouseleave", ".path", function () {
        $("#candidateTip").css("display", "none");
    });

    $("svg").on("mouseenter", ".event", function (e) {
        $("#eventTip").css("display", "block").css("left", e.clientX).css("top", e.clientY - 10);
        $("#eventTipDate").text($(this).attr("date"));
        $("#eventTipDescription").text($(this).attr("description"));
    }).on("mouseleave", ".event", function (e) {
        $("#eventTip").css("display", "none");
    });

    $("#candidateTip,#eventTip").on("mouseenter", function () {
        $(this).css("display", "block");
    }).on("mouseleave", function () {
        $(this).css("display", "none");
    })
};

// call funcitons
draw("rep");
draw("dem");
bindEvent();