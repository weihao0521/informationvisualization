/**
 * Created by Ian on 9/29/2015.
 */
var color = (function () {
    var color = ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"];
    var range = ["45% - 50%", "50% - 55%", "55% - 60%", "60% - 65%", "65% - 70%", "> 70%"];
    return {
        getFillKey: function (percent) {
            if (percent >= 45 && percent <= 50) {
                return "45";
            } else if (percent <= 55) {
                return "50";
            } else if (percent <= 60) {
                return "55";
            } else if (percent <= 65) {
                return "60";
            } else if (percent <= 70) {
                return "65";
            } else {
                return "70";
            }
        },
        getColor: function (index) {
            return color[index];
        },
        getRange: function(index){
            return range[index];
        }
    };
})();