(function () {
    var candidate = getCandidate();
    var party = getParty();
    var map = {
        data: {},
        init: function () {
            this.loadData();
        },
        loadData: function () {
            d3.csv("../../data/map/bothParty_map.csv", function (error, data) {
                var newData = {};
                for (var index = 0, length = data.length; index < length; index++) {
                    if (data[index].candidate == candidate) {
                        newData.candidate = data[index].candidate;
                        for (var key in data[index]) {
                            if (key != "candidate") {
                                newData[key] = {};
                                newData[key].value = parseInt(data[index][key]);
                            }
                        }
                    } else if (data[index].candidate == "Swing States") {
                        for (var key in newData) {
                            newData[key].isSwing = data[index][key] == "Yes" ? true : false;
                        }
                    }
                    if (party == "dem") {
                        if (data[index].candidate == "D_Date") {
                            for (var key in newData) {
                                newData[key].date = data[index][key];
                            }
                        }
                    }
                    if (party == "rep") {
                        if (data[index].candidate == "R_Date") {
                            for (var key in newData) {
                                newData[key].date = data[index][key];
                            }
                        }
                    }
                }
                map.data = newData;
                map.draw();
            });

        },
        processDataColor: function () {
            for (var key in map.data) {
                if (map.data.candidate == candidate) {
                    if (map.data[key].isSwing) {
                        map.data[key].fillKey = color.getFillKeySwing(map.data[key].value, candidate);
                    } else {
                        map.data[key].fillKey = color.getFillKey(map.data[key].value, candidate, party);
                    }
                }
            }
        },
        drawColorTip: function (id) {
            var ul = $(document.createElement("ul"));
            for (var index = 0; index < 7; index++) {
                var li = $(document.createElement("li"));
                var span = $(document.createElement("span"));
                var span2 = $(document.createElement("span"));
                var span3 = $(document.createElement("span"));
                span.css("background-color", color.getColor(index, false));
                span.css("width", "16px");
                span.css("height", "16px");
                span.css("display", "inline-block");

                span2.css("background-color", color.getColor(index, true));
                span2.css("width", "16px");
                span2.css("height", "16px");
                span2.css("display", "inline-block");

                span3.text(color.getRange(index, candidate));
                ul.append(li);

                li.append(span);
                li.append(span2)
                li.append(span3);
            }
            ul.css("text-align", "left");
            ul.css("position", "absolute");
            ul.css("top", $("#mapDiv").height() * 0.3)
            ul.css("left","50px");

            var li = $(document.createElement("li"));
            li.text("Left is not swing state")
            ul.append(li);
            var li = $(document.createElement("li"));
            li.text("Right is swing state");
            ul.append(li);
            $("#" + id).append(ul);
        },
        draw: function () {
            $("#mapDiv").empty();
            this.drawColorTip("mapDiv");
            this.processDataColor();
            var dataMap = new Datamap({
                element: document.getElementById('mapDiv'),
                width: $("#mapDiv").width() * 0.7,
                height: $("#mapDiv").height() * 0.7,
                done: function () {
                    $(".datamaps-subunits").attr("transform", "translate(" + $('#mapDiv').width() * 0.15 + "," + $('#mapDiv').height() * 0.05 + ")");
                    $(".datamap").attr("height", $("#mapDiv").height()-100);
                    $(".datamap").attr("width", $("#mapDiv").width());
                },
                scope: 'usa',
                fills: {
                    0: "#d0d1e6",
                    10: "#fcc5c0",
                    20: "#fed976",
                    1: "#a6bddb",
                    11: "#fa9fb5",
                    21: "#feb24c",
                    2: "#74a9cf",
                    12: "#f768a1",
                    22: "#fd8d3c",
                    3: "#3690c0",
                    13: "#dd3497",
                    23: "#fc4e2a",
                    4: "#0570b0",
                    14: "#ae017e",
                    24: "#e31a1c",
                    5: "#034e7b",
                    15: "#7a0177",
                    25: "#b10026",
                    defaultFill: '#F8F9D0'
                },
                data: map.data,
                geographyConfig: {
                    popupTemplate: function (geo, d) {
                        if (d) {
                            return '<div class="hoverinfo"><strong>'
                                + 'Percent of  ' + geo.properties.name
                                + ': ' + d.value + '%<br/>' + 'Completed by '
                                + d.date
                                + '</strong></div>';
                        }
                    }
                }
            });
        }
    };
    var color = (function () {
        var D_color = ["#F8F9D0", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"];
        var R_color = ["#F8F9D0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];
        var color_swing = ["#F8F9D0", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"];
        var H_range = [" No Data Available", " Less than 50%", " 50% - 55%", " 55% - 60%", " 60% - 65%", " 65% - 70%", "70% - 75%"];
        var S_range = [" No Data Available", " Less than 15%", " 15% - 20%", " 20% - 25%", " 20% - 30%", " 30% - 40%", " 40% - 50%"];
        var T_range = [" No Data Available", " Less than 20%", " 20% - 23%", " 23% - 25%", " 25% - 28%", " 28% - 30%", " 30% - 40%"];
        var C_range = [" No Data Available", " Less than 5%", " 5% - 8%", " 8% - 14%", " 14% - 18%", " 18% - 25%", " 25% - 30%"];
        var BC_range = [" No Data Available", " Less than 5%", " 5% - 10%", " 10% - 15%", " 15% - 20%", " 20% - 25%", " 25% - 35%"];
        var B_range = [" No Data Available", " Less than 2%", " 2% - 4%", " 4% - 6%", " 6% - 8%", " 8% - 10%", " 10% - 12%"];
        var R_range = [" No Data Available", " Less than 10%", " 10% - 12%", " 12% - 14%", " 14% - 16%", " 16% - 18%", " 18% - 20%"];

        var range = {
            Clinton: [45, 50, 55, 60, 65, 75],
            Sanders: [15, 20, 25, 30, 40, 50],
            Trump: [20, 23, 25, 28, 30, 40],
            Cruz: [5, 8, 14, 18, 25, 30],
            Carson: [5, 10, 15, 20, 25, 35],
            Bush: [2, 4, 6, 8, 10, 12],
            Rubio: [10, 12, 14, 16, 18, 20]
        }
        return {
            getFillKey: function (percent, candidate, party) {
                var rangeArray = range[candidate];
                if (party == "dem") {
                    for (var index = 0; index < rangeArray.length; index++) {
                        if (percent <= rangeArray[index]) {
                            return index;
                        }
                    }
                }
                else if (party == "rep") {
                    for (var index = 0; index < rangeArray.length; index++) {
                        if (percent <= rangeArray[index]) {
                            return index + 20;
                        }
                    }
                }
            },
            getFillKeySwing: function (percent, candidate) {
                var rangeArray = range[candidate];
                for (var index = 0; index < rangeArray.length; index++) {
                    if (percent <= rangeArray[index]) {
                        return index + 10;
                    }
                }
            },
            getColor: function (index, isSwing) {
                if (isSwing == true) {
                    return color_swing[index];
                }
                else if (party == "dem") {
                    return D_color[index];
                }
                else if (party == "rep") {
                    return R_color[index];
                }
            },
            getRange: function (index, candidate) {
                if (candidate == "Clinton") {
                    return H_range[index];
                }
                if (candidate == "Sanders") {
                    return S_range[index];
                }
                if (candidate == "Trump") {
                    return T_range[index];
                }
                if (candidate == "Cruz") {
                    return C_range[index];
                }
                if (candidate == "Carson") {
                    return BC_range[index];
                }
                if (candidate == "Bush") {
                    return B_range[index];
                }
                if (candidate == "Rubio") {
                    return R_range[index];
                }
            }
        };
    })();
    map.init();
})();