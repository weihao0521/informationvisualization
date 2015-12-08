(function () {
    var CollapsibleTree = function (elt) {

        var m = [20, 20, 20, 20],
            w = $(elt).width() - m[1] - m[3],
            h = $(elt).height() - m[0] - m[2],
            i = 0,
            root,
            root2,
            dataSources,
            dataSource,
            wholeData,
            candidate = getCandidate();

        var tree = d3.layout.tree()
            // .size([h, w]);
            .size([w, h]);

        // var diagonal = d3.svg.diagonal()
        //     .projection(function(d) { return [d.y, d.x]; });

        var parentdiagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [d.x, -d.y * 2];
            });

        var childdiagonal = d3.svg.diagonal()
            .projection(function (d) {
                return [d.x, d.y * 2];
            });

        var vis = d3.select(elt)
            .attr("width", w + m[1] + m[3])
            .attr("height", h + m[0] + m[2])
            .append("svg:g")
            .attr("id", "tree_g")
            // .attr("transform", "translate(" + m[3] + "," + m[0] + ")"); // left-right
            // .attr("transform", "translate(" + m[0] + "," + m[3] + ")"); // top-bottom
            //.attr("transform", "translate(0,"+h/2+")"); // bidirectional-tree
            .attr("transform", "translate(20,30)");


        var that = {
            init: function (url) {
                var that = this;

                d3.csv(url, function (error, data) {
                    if (error) throw error;

                    wholeData = data;

                    // find out sources
                    var temp = {};
                    data.forEach(function (d) {
                        temp[d.source] = d.source;
                    })
                    dataSources = [];
                    for (var key in temp) {
                        dataSources.push(temp[key]);
                    }
                    dataSource = dataSources[0];

                    that.addSourceRadio();
                    that.parseData();
                });

                /*d3.json(url, function (json) {
                 root = json;

                 // root.x0 = h / 2;
                 // root.y0 = 0;
                 root.x0 = w / 2;
                 root.y0 = h / 2;

                 // Initialize the display to show a few nodes.
                 root.children.forEach(that.toggleAll);
                 // that.toggle(root.children[1]);
                 // that.toggle(root.children[1].children[2]);
                 // that.toggle(root.children[9]);
                 // that.toggle(root.children[9].children[0]);

                 // that.updateParents(root);
                 // that.updateChildren(root);
                 that.updateBoth(root);
                 });*/
            },
            addSourceRadio: function () {
                var sources = dataSources;
                var html = "";
                for (var index = 0; index < sources.length; index++) {
                    if (index == 0) {
                        html += '<input class="tree source" type="radio" name="tree_source" value="' + sources[index] + '" checked="checked"/><span>' + sources[index] + '</span>';
                    } else {
                        html += '&nbsp;<input class="tree source" type="radio" name="tree_source" value="' + sources[index] + '"/><span>' + sources[index] + '</span>';
                    }
                }
                $("#treeRadioDiv").html(html);

                // event to change source
                $("#treeRadioDiv").on("mouseup", ".tree.source", function () {
                    $(".tree.source").attr("checked", false);
                    $(this).attr("checked", true);
                    var newSource = $(this).attr("value");
                    if (newSource != dataSource) {
                        dataSource = newSource;
                        $("#tree_g").empty();
                        that.parseData();
                    }
                });
            },
            parseData: function () {
                // get data from one source
                var data = wholeData.filter(function (d) {
                    return d.source == dataSource && d.candidate == candidate;
                });
                data.sort(function (a, b) {
                    return +a.rival_rank - +b.rival_rank;
                })

                root = {
                    name: data[0].candidate,
                    children: []
                };
                data.forEach(function (d) {
                    root.children.push({
                        name: d.rival,
                        isParent: false,
                        candidate_rate: +d.candidate_rate,
                        rival_rate: +d.rival_rate,
                        rival_rank: +d.rival_rank
                    });
                });
                root.x0 = w / 2;
                root.y0 = h;
                root.children.forEach(that.toggleAll);
                that.updateBoth(root)
            },
            updateBoth: function (source) {
                var duration = d3.event && d3.event.altKey ? 5000 : 500;

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse();

                // Normalize for fixed-depth.
                nodes.forEach(function (d) {
                    d.y = d.depth * 120;
                });

                // Update the nodes…
                var node = vis.selectAll("g.node")
                    .data(nodes, function (d) {
                        return d.id || (d.id = ++i);
                    });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("svg:g")
                    .attr("class", function (d) {
                        return "node " + d.name;
                    })
                    .attr("name", function (d) {
                        return d.name;
                    })
                    .attr("transform", function (d) {
                        return "translate(" + source.x0 + "," + source.y0 * 2 + ")";
                    })
                    .on("click", function (d) {
                        that.toggle(d);
                        that.updateBoth(d);
                    })
                    .on("mouseenter", function (d) {
                        var name = $(this).attr("name");
                        if (name == candidate) {
                            $(".circle." + candidate).attr("r", 15);
                        } else {
                            var candidate_rate = d.candidate_rate;
                            var rival_rate = d.rival_rate;
                            $(".circle." + candidate)
                                .attr("r", function () {
                                    return candidate_rate / 2;
                                })
                                .css("fill", function () {
                                    if (d.candidate_rate > d.rival_rate) {
                                        return "crimson"
                                    } else if (d.candidate_rate < d.rival_rate) {
                                        return "blue";
                                    } else {
                                        return "black";
                                    }
                                });
                            $(".circle." + name)
                                .attr("r", function () {
                                    return rival_rate / 2;
                                })
                                .css("fill", function () {
                                    if (d.candidate_rate < d.rival_rate) {
                                        return "crimson"
                                    } else if (d.candidate_rate > d.rival_rate) {
                                        return "blue";
                                    } else {
                                        return "black";
                                    }
                                });

                            $(".rate." + candidate).text(d.candidate_rate + "%")
                                .css("fill", "yellow")
                            $(".rate." + name).text(d.rival_rate + "%")
                                .css("fill", "yellow");
                        }
                    })
                    .on("mouseleave", function (d) {
                        var name = $(this).attr("name");
                        if (name == candidate) {
                            $(".circle." + candidate).attr("r", 10)
                                .css("fill", "lightblue");
                        } else {
                            var candidate_rate = d.candidate_rate;
                            var rival_rate = d.rival_rate;
                            $(".circle." + candidate)
                                .attr("r", 10)
                                .css("fill", "lightblue");
                            $(".circle." + name)
                                .attr("r", 10)
                                .css("fill", "lightblue");
                            $(".rate." + candidate).text("");
                            $(".rate." + name).text("");
                        }
                    });

                nodeEnter.append("svg:circle")
                    .attr("class", function (d) {
                        return "circle " + d.name;
                    })
                    .attr("r", 1e-6)
                /*.style("fill", function (d) {
                 return d._children ? "lightsteelblue" : "#fff";
                 });*/


                nodeEnter.append("svg:text")
                    // .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
                    .attr("x", function (d) {
                        if (that.isParent(d)) {
                            return -10;
                        } else {
                            return d.children || d._children ? -10 : 10;
                        }
                    })
                    .attr("dy", ".35em")
                    // .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                    .attr("text-anchor", function (d) {
                        if (that.isParent(d)) {
                            return "end";
                        } else {
                            return d.children || d._children ? "end" : "start";
                        }
                    })
                    /*.attr("transform", function (d) {
                     if (d != root) {
                     if (that.isParent(d)) {
                     return "rotate(45)";
                     } else {
                     return "rotate(45)";
                     }
                     }
                     })*/
                    .text(function (d) {
                        return d.name;
                    })
                    .attr("transform", function (d) {
                        return d.name == candidate ? "translate(-15,0)" : "translate(15,0)"
                    })
                    .style("fill-opacity", 1e-6);

                nodeEnter.append("svg:text")
                    .attr("class", function (d) {
                        return "rate " + d.name;
                    })
                    .attr("transform", "translate(-11,4)");

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        if (that.isParent(d)) {
                            return "translate(" + d.x + "," + -d.y * 2 + ")";
                        } else {
                            return "translate(" + d.x + "," + d.y * 2 + ")";
                        }
                    });

                nodeUpdate.select("circle")
                    .attr("r", 10)
                /*.style("fill", function (d) {
                 return d._children ? "lightsteelblue" : "#fff";
                 });*/

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    // .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                    .attr("transform", function (d) {
                        return "translate(" + source.x + "," + source.y * 2 + ")";
                    })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 10);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = vis.selectAll("path.link")
                    .data(tree.links_parents(nodes).concat(tree.links(nodes)), function (d) {
                        return d.target.id;
                    });

                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g")
                    .attr("class", "link")
                    .attr("d", function (d) {
                        var o = {x: source.x0, y: source.y0 * 2};
                        if (that.isParent(d.target)) {
                            return parentdiagonal({source: o, target: o});
                        } else {
                            // return parentdiagonal({source: o, target: o});
                            return childdiagonal({source: o, target: o});
                        }
                    })
                    .transition()
                    .duration(duration)
                    // .attr("d", parentdiagonal);
                    .attr("d", function (d) {
                        if (that.isParent(d.target)) {
                            return parentdiagonal(d);
                        } else {
                            // return parentdiagonal(d);
                            return childdiagonal(d);
                        }
                    })

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    // .attr("d", parentdiagonal);
                    .attr("d", function (d) {
                        if (that.isParent(d.target)) {
                            return parentdiagonal(d);
                        } else {
                            return childdiagonal(d);
                        }
                    })

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function (d) {
                        var o = {x: source.x, y: source.y * 2};
                        // return parentdiagonal({source: o, target: o});
                        if (that.isParent(d.target)) {
                            return parentdiagonal({source: o, target: o});
                        } else {
                            return childdiagonal({source: o, target: o});
                        }
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y * 2;
                });
            },


            isParent: function (node) {
                if (node.parent && node.parent != root) {
                    return this.isParent(node.parent);
                } else
                // if ( node.name == 'data' || node.name == 'scale' || node.name == 'util' ) {
                if (node.isparent) {
                    return true;
                } else {
                    return false;
                }
            },

            // Toggle children.
            toggle: function (d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                if (d.parents) {
                    d._parents = d.parents;
                    d.parents = null;
                } else {
                    d.parents = d._parents;
                    d._parents = null;
                }
            },
            toggleAll: function (d) {
                if (d.children) {
                    d.children.forEach(that.toggleAll);
                    that.toggle(d);
                }
                if (d.parents) {
                    d.parents.forEach(that.toggleAll);
                    that.toggle(d);
                }
            }

        };
        return that;
    }
    CollapsibleTree("#tree").init('../../data/tree/match_up.csv');
})();