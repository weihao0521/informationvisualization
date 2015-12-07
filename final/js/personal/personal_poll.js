(function () {
    var poll = {
        var: {
            data: {}
        },
        init: function () {
            //initialize variables
            this.var.margin = {top: 20, right: 20, bottom: 30, left: 50};
            this.var.width = $("#poll").width() - this.var.margin.left - this.var.margin.right;
            this.var.height = $("#poll").height() - this.var.margin.top - this.var.margin.bottom;

            this.var.color = d3.scale.category20();

            this.var.x = d3.time.scale()
                .range([0, this.var.width]);
            this.var.y = d3.scale.linear()
                .range([this.var.height, 0]);
            this.var.xAxis = d3.svg.axis()
                .scale(this.var.x)
                .orient("bottom")
                .ticks(d3.time.month, 3)
                .tickFormat(d3.time.format("%B,%Y"));
            this.var.yAxis = d3.svg.axis()
                .scale(this.var.y)
                .orient("left");

            this.var.candidate = getCandidate();
            this.var.party = getParty();

            this.var.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            this.var.sources = {};

            // start drawing
            this.drawStart();
        },
        drawStart: function () {
            //start drawing
            this.var.svg = d3.select("#poll")
                .attr("width", this.var.width + this.var.margin.left + this.var.margin.right)
                .attr("height", this.var.height + this.var.margin.top + this.var.margin.bottom)
                .append("g")
                .attr("id", "poll_g")
                .attr("width", this.var.width)
                .attr("height", this.var.height)
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
            // load individual poll data
            d3.csv("../data/poll/" + this.var.party + "_Individual_Poll.csv", function (error, data) {
                if (error) throw error;
                var dateParser = d3.time.format("%m/%_d/%Y").parse;

                // filter data, remain data after certain date
                var baseDate = new Date(2015, 0, 1);// Jan 1, 2015
                data = data.filter(function (d) {
                    return new Date(dateParser(d.date)) >= baseDate;
                });

                // process data
                data.forEach(function (d, i) {
                    // add sources to poll.var.sources
                    poll.var.sources[d.source] = d.source;

                    d.date = dateParser(d.date);
                    d[poll.var.candidate] = +d[poll.var.candidate];
                });

                // filter out data that are not available for this candidate
                data = data.filter(function (d) {
                    return !isNaN(d[poll.var.candidate]);
                });

                poll.processSource(data);

                // load public event data
                d3.tsv("../data/event/" + poll.var.party + "GroupEvent.tsv", function (error, data) {
                    if (error) throw error;

                    // process data
                    var dateParser = d3.time.format("%Y/%m/%_d").parse;
                    data.forEach(function (d) {// process data
                        d.date = dateParser(d.date);
                    });

                    poll.var.data.publicEvent = data;

                    //draw event lines
                    poll.drawEvent(poll.var.data.publicEvent, "public");
                });

                // load individual event data
                d3.tsv("../data/event/" + poll.var.party + "IndividualEvent.tsv", function (error, data) {
                    if (error) throw error;

                    data = data.filter(function (d) {
                        if (d.candidate) {
                            return d.candidate.indexOf(poll.var.candidate) >= 0;
                        }
                    });

                    // process data
                    var dateParser = d3.time.format("%Y/%m/%_d").parse;
                    data.forEach(function (d) {// process data
                        d.date = dateParser(d.date);
                    });

                    poll.var.data.individual = data;

                    //draw event lines
                    poll.drawEvent(poll.var.data.individual, "individual");
                });
            });
            poll.bindEvent();
        },
        processSource: function (data) {
            // process source
            var tempSources = [];
            for (var key in poll.var.sources) {
                tempSources.push(poll.var.sources[key]);
            }
            poll.var.sources = tempSources;
            poll.var.source = poll.var.sources[0];
            poll.var.data.path = data;

            poll.addSourceRadio();
            poll.drawPathBySource();
        },
        addSourceRadio: function () {
            var sources = this.var.sources;
            var html = "";
            for (var index = 0; index < sources.length; index++) {
                if (index == 0) {
                    html += '<input class="poll source" type="radio" name="poll_source" value="' + sources[index] + '" checked="checked"/><span>' + sources[index] + '</span>';
                } else {
                    html += '<input class="poll source" type="radio" name="poll_source" value="' + sources[index] + '"/><span>' + sources[index] + '</span>';
                }
            }
            $("#pollRadioDiv").html(html);
        },
        drawPathBySource: function () {
            var data = poll.var.data.path;
            var source = poll.var.source;
            data = data.filter(function (d) {
                return source == d.source;
            });

            //draw axis and paths
            this.drawAxis(data);
            this.drawPath(data);
        },
        drawAxis: function (data) {
            // set axis range
            this.var.x.domain(d3.extent(data, function (d) {
                return d.date;
            }));
            this.var.y.domain([d3.min(data, function (d) {
                return d[poll.var.candidate] / 1.1;
            }), d3.max(data, function (d) {
                return d[poll.var.candidate] * 1.1;
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
        drawPath: function (data) {// draw plot paths
            // generate data for plot path
            var candidate = this.var.candidate;
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
                .attr("name", candidate)
                //.attr("xlink:href", "./personal.html?candidate=" + candidate)
                .attr("target", "_blank");
            gLine.append("path")
                .attr("d", this.var.pathFn)
                .attr("stroke", this.var.color(0));
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
                .attr("fill", this.var.color(+0))
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

        },
        drawEvent: function (data, type) {
            var gEvent = this.var.svg.selectAll("." + type + "Event")
                .data(data)
                .enter()
                .append("g")
                .attr("class", type + "Event event")
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
                })
                .attr("candidate", function (d) {
                    return d.candidate ? d.candidate : "";
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
            $("#poll").on("mouseenter", ".path", function (e) {
                console.log("path");
                // hide value and date
                $("#candidateTipValue").css("display", "none");
                $("#candidateTipDate").css("display", "none");

                $("#candidateTip").css("display", "block").css("left", e.clientX + 2).css("top", e.clientY - 5);
            }).on("mouseleave", ".path", function () {
                $("#candidateTip").css("display", "none");
            });

            // event tip
            $("#poll").on("mouseenter", ".event", function (e) {
                $("#eventTip").css("display", "block").css("left", e.clientX + 2).css("top", e.clientY - 10);
                $("#eventTipDate").text($(this).attr("date"));
                $("#eventTipDescription").text($(this).attr("description"));
                var candidate = $(this).attr("candidate")
                if (candidate) {
                    $("#eventTipCandidateDiv").css("display", "block");
                    $("#eventTipCandidate").text(candidate);
                } else {
                    $("#eventTipCandidateDiv").css("display", "none");
                }
            }).on("mouseleave", ".event", function (e) {
                $("#eventTip").css("display", "none");
            });

            // circle tip
            $("#poll").on("mouseenter", ".circle", function (e) {
                e.stopPropagation();// do not trigger .path event
                console.log("circle");

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

            // event to change source
            $("#pollRadioDiv").on("mouseup", ".poll.source", function () {
                $(".poll.source").attr("checked", false);
                $(this).attr("checked", true);
                var newSource = $(this).attr("value");
                if (newSource != poll.var.source) {
                    poll.var.source = newSource;
                    $("#poll_g").empty();
                    poll.drawPathBySource();
                    poll.drawEvent(poll.var.data.publicEvent, "public");
                    poll.drawEvent(poll.var.data.individual, "private");
                }
            });
        }
    };
    poll.init();
})();