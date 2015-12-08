(function () {
    var poll = {
        var: {},
        init: function () {
            //initialize variables
            this.var.margin = {top: 20, right: 20, bottom: 30, left: 50};
            this.var.width = $("#svgDiv").width() / 2 - this.var.margin.left - this.var.margin.right;
            this.var.height = $("#svgDiv").height() - this.var.margin.top - this.var.margin.bottom;

            this.var.color = d3.scale.category20();

            this.var.x = d3.time.scale()
                .range([0, this.var.width]);
            this.var.y = d3.scale.linear()
                .range([this.var.height, 0]);
            this.var.xAxis = d3.svg.axis()
                .scale(this.var.x)
                .orient("bottom")
                .ticks(d3.time.month, 1)
                .tickFormat(d3.time.format("%B"));
            this.var.yAxis = d3.svg.axis()
                .scale(this.var.y)
                .orient("left");

            this.var.candidates = {
                dem: ["Clinton", "Sanders"],
                rep: ["Trump", "Carson", "Rubio", "Cruz", "Bush"]
            };// filtered out some candidates
            this.var.months = ["January", "February", "March", "April", "June", "July", "August", "September", "October", "November", "December"];

            // start drawing
            this.drawStart("rep");
            // this.drawStart("dem");
        },
        drawStart: function (party) {
            this.var.party = party;

            //start drawing
            this.var.svg = d3.select("#"+party+"Svg")
                .attr("width", this.var.width + this.var.margin.left + this.var.margin.right)
                .attr("height", this.var.height + this.var.margin.top + this.var.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + this.var.margin.left + "," + this.var.margin.top + ")")
                .attr("class", this.var.party + "_plot");

            this.var.pathFn = d3.svg.line()
                .x(function (d) {
                    return poll.var.x(d.date);
                })
                .y(function (d) {
                    return poll.var.y(d.poll);
                });

            // load data
            this.loadData();
        },
        loadData: function () {
            // load path data
            d3.csv("../../data/poll/2016_poll_" + this.var.party + ".csv", function (error, data) {
                if (error) throw error;

                // filter data with Array.prototype.filter
                var dateParser = d3.time.format("%m/%_d/%Y").parse;
                var baseDate = new Date(2015, 6, 1);// July 1, 2015
                data = data.filter(function (d) {
                    return new Date(dateParser(d.date)) >= baseDate;
                });

                // process data
                data.forEach(function (d, i) {
                    d.date = dateParser(d.date);
                    for (var key in poll.var.candidates[poll.var.party]) {
                        d[poll.var.candidates[poll.var.party][key]] = +d[poll.var.candidates[poll.var.party][key]];
                    }
                });

                //draw axis and paths
                poll.drawAxis(data);
                poll.drawPath(data);

                // load event data
                d3.tsv("../../data/event/" + poll.var.party + "GroupEvent.tsv", function (error, data) {
                    if (error) throw error;

                    // process data
                    var dateParser = d3.time.format("%Y/%m/%_d").parse;
                    data.forEach(function (d) {// process data
                        d.date = dateParser(d.date);
                    });

                    //draw event lines
                    poll.drawEvent(data);

                    //end drawing
                    if (poll.var.party == "rep") {
                        poll.drawStart("dem");
                    } else {
                        poll.bindEvent();
                    }
                });
            });
        },
        drawAxis: function (data) {
            // set axis range
            this.var.x.domain(d3.extent(data, function (d) {
                return d.date;
            }));
            this.var.y.domain([0, d3.max(data, function (d) {
                var arg = [];
                for (var key in poll.var.candidates[poll.var.party]) {
                    arg.push(d[poll.var.candidates[poll.var.party][key]]);
                }
                return Math.max.apply(this, arg);
            })]);

            // draw axis
            this.var.svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + this.var.height + ")")
                .call(this.var.xAxis);
            this.var.svg.append("g")
                .attr("class", "y axis")
                .call(this.var.yAxis)
                .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("poll (%)");
        },
        drawPath: function (data) {
            // draw plot paths
            for (var key in this.var.candidates[this.var.party]) {
                // generate data for plot path
                var candidate = this.var.candidates[this.var.party][key];
                var pathData = [];
                for (var dataIndex in data) {
                    var d = data[dataIndex];
                    if (!isNaN(d[candidate])) {
                        pathData.push({
                            date: d.date,
                            poll: d[candidate]
                        })
                    }
                }

                // draw path
                var gLine = this.var.svg.append("a")
                    .datum(pathData)
                    .attr("class", "path")
                    .attr("candidate", candidate)
                    .attr("xlink:href", "./personal.html?candidate=" + candidate)
                    .attr("target", "_blank");
                gLine.append("path")
                    .attr("d", this.var.pathFn)
                    .attr("stroke", this.var.color(+key));
                gLine.selectAll(".circle").data(pathData)
                    .enter().append("circle")
                    .attr("class", "circle")
                    .attr("r", 5)
                    .attr("cx", function (d) {
                        return poll.var.x(new Date(d.date));
                    })
                    .attr("cy", function (d) {
                        return poll.var.height - poll.var.margin.top - poll.var.margin.bottom - (poll.var.height - poll.var.margin.top - poll.var.margin.bottom - poll.var.y(d.poll));
                    })
                    .attr("fill", this.var.color(+key))
                    .attr("candidate", candidate)
                    .attr("date", function (d) {
                        var date = new Date(d.date);
                        var yyyy = date.getFullYear().toString();
                        var mm = date.getMonth(); // getMonth() is zero-based
                        var dd = date.getDate().toString();
                        mm = poll.var.months[mm];
                        return mm + " " + dd + ", " + yyyy;
                    })
                    .attr("percentage", function (d) {
                        return d.poll;
                    });
            }
        },
        drawEvent: function (data) {
            var gEvent = this.var.svg.selectAll(".event")
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
                    mm = poll.var.months[mm];
                    return mm + " " + dd + ", " + yyyy;
                });
            gEvent.append("line")
                .attr("class", "event_line")
                .attr("x1", function (d) {
                    return parseInt(poll.var.x(new Date(d.date)));
                })
                .attr("y1", 0)
                .attr("x2", function (d) {
                    return parseInt(poll.var.x(new Date(d.date)));
                })
                .attr("y2", this.var.height)
                .attr("stroke", "#000")
                .attr("stroke-width", "2px");
        },
        bindEvent: function () {
            // path tip
            $("svg").on("mouseenter", ".path", function (e) {
                // hide value and date
                $("#candidateTipValue").css("display", "none");
                $("#candidateTipDate").css("display", "none");

                $("#candidateTip").css("display", "block").css("left", e.clientX + 2).css("top", e.clientY - 5);
            }).on("mouseleave", ".path", function () {
                $("#candidateTip").css("display", "none");
            });

            // event tip
            $("svg").on("mouseenter", ".event", function (e) {
                $("#eventTip").css("display", "block").css("left", e.clientX + 2).css("top", e.clientY - 10);
                $("#eventTipDate").text($(this).attr("date"));
                $("#eventTipDescription").text($(this).attr("description"));
            }).on("mouseleave", ".event", function (e) {
                $("#eventTip").css("display", "none");
            });

            // circle tip
            $("svg").on("mouseenter", ".circle", function (e) {
                e.stopPropagation();// do not trigger .path event

                $("#candidateTip").css("display", "block").css("left", e.clientX + 2).css("top", e.clientY - 5);
                $("#candidateTipName").text($(this).attr("candidate"));
                $("#candidateTipLink").attr("href", "./personal.html?candidate=" + $(this).attr("candidate"));

                $("#candidateTipValue").css("display", "block").text("Percentage: " + $(this).attr("percentage"));
                $("#candidateTipDate").css("display", "block").text("Date: " + $(this).attr("date"));
            }).on("mouseleave", ".circle", function () {
                $("#candidateTip").css("display", "none");
            });

            // event for mouse tip divs
            $(".pollMouseTip").on("mouseenter", function () {
                $(this).css("display", "block");
            }).on("mouseleave", function () {
                $(this).css("display", "none");
            });
        }
    };
    poll.init();
})();