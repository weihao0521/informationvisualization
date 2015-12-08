(function () {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = $("#treemap").width() - margin.left - margin.right,
        height = $("#treemap").height() - margin.top - margin.bottom;

    var color = d3.scale.category20c();

    var treemap = d3.layout.treemap()
        .size([width, height])
        .sticky(true)
        .value(function (d) {
            return d.size;
        });

    var div = d3.select("#treemap")
        .style("position", "relative")
        .style("width", (width + margin.left + margin.right) + "px")
        .style("height", (height + margin.top + margin.bottom) + "px")

    d3.json("../../data/SuperPAC/SuperPAC.json", function (error, root) {
        if (error) throw error;

        var node = div.datum(root).selectAll(".node")
            .data(treemap.nodes)
            .enter().append("div")
            .attr("class", "node")
            .call(position)
            .style("width", width)
            .style("height", height)
            /*            .style("left", margin.left + "px")
             .style("top", margin.top + "px")*/
            .style("background", function (d) {
                if (d.children) {
                    if (d.name == "Hillary Clinton") {
                        return "Yellow";
                    }
                    else {
                        return color(d.name);
                    }

                }
                else {
                    return null;
                }

            })
            .text(function (d) {
                return d.children ? null : d.name;
            })
            .style("font-size", "14px")
            .style("text-align", "center");

        $(".treemap.source").on("change", function change() {
            var value = this.value === "3"
                ? function (d) {
                return d.size2
            }
                : function (d) {
                return d.size;
            };

            node
                .data(treemap.value(value).nodes)
                .transition()
                .duration(1500)
                .call(position);
        });
    });

    function position() {
        this.style("left", function (d) {
                return d.x + margin.left + "px";
            })
            .style("top", function (d) {
                return d.y + margin.top + "px";
            })
            .style("width", function (d) {
                return Math.max(0, d.dx - 1) + "px";
            })
            .style("height", function (d) {
                return Math.max(0, d.dy - 1) + "px";
            });
    }
})();