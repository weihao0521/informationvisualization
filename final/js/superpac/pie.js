(function () {
    var width = $("#pie").width(),
        height = $("#pie").height(),
        radius = Math.min(width, height) / 2;

    var svg = d3.select("#pie")
        .append("g")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");

    var pie = d3.layout.pie()
        .sort(null)
        .value(function (d) {
            return d.value;
        });

    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var key = function (d) {
        return d.data.label;
    };

    var candidate = getCandidate();

    var a1 = [], a2 = {}
    d3.json("../../data/SuperPAC/SuperPAC_State.json", function (data) {
        var array = data.SuperPAC_State;
        for (var index = 0; index < array.length; index++) {
            var d = array[index];
            if (d.name.indexOf(candidate) >= 0) {
                for (var index2 = 0; index2 < d.state.length; index2++) {
                    var state = d.state[index2];
                    a1.push(state.name);
                    a2[state.name] = state.size;
                }

            }
        }

        var color = d3.scale.ordinal()
            .domain(a1)
            .range(["#e66101", "#fdb863", "#f7f7f7", "#b2abd2", "#5e3c99"]);

        function randomData() {
            var labels = color.domain();
            return labels.map(function (label) {
                return {label: label, value: a2[label]}
            });
        }

        change(randomData());

        d3.select(".randomize")
            .on("click", function () {
                change(randomData());
            });


        function change(data) {

            var slice = svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);

            var total = 0;
            for (var index = 0; index < data.length; index++) {
                total += data[index].value;
            }

            slice.enter()
                .insert("path")
                .style("fill", function (d) {
                    return color(d.data.label);
                })
                .attr("state", function (d) {
                    return d.data.label;
                })
                .attr("percentage", function (d) {
                    return (d.data.value / total * 100).toFixed(1) + "%";
                })
                .attr("class", "slice");
            $("#pie")
                .on("mouseenter", ".slice", function (e) {
                    console.log(e);
                    $("#pieTip").css("display", "block").css("left", e.clientX + 2).css("top", e.clientY - 5);
                    $("#pieTipState").text($(this).attr("state"));
                    $("#pieTipPercentage").text($(this).attr("percentage"));
                })
                .on("mouseleave", ".slice", function (e) {
                    $("#pieTip").css("display", "none");
                });

            slice
                .transition().duration(1000)
                .attrTween("d", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        return arc(interpolate(t));
                    };
                })

            slice.exit()
                .remove();


            var text = svg.select(".labels").selectAll("text")
                .data(pie(data), key);

            text.enter()
                .append("text")
                .attr("dy", ".35em")
                .text(function (d) {
                    return d.data.label;
                });

            function midAngle(d) {
                return d.startAngle + (d.endAngle - d.startAngle) / 2;
            }

            text.transition().duration(1000)
                .attrTween("transform", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                        return "translate(" + pos + ")";
                    };
                })
                .styleTween("text-anchor", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        var d2 = interpolate(t);
                        return midAngle(d2) < Math.PI ? "start" : "end";
                    };
                });

            text.exit()
                .remove();

            var polyline = svg.select(".lines").selectAll("polyline")
                .data(pie(data), key);

            polyline.enter()
                .append("polyline")
                .attr("class", "polyline");

            polyline.transition().duration(1000)
                .attrTween("points", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        var d2 = interpolate(t);
                        var pos = outerArc.centroid(d2);
                        pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                        return [arc.centroid(d2), outerArc.centroid(d2), pos];
                    };
                });

            polyline.exit()
                .remove();
        };

    })
})();