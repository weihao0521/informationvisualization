/**
 * Created by Ian on 9/29/2015.
 */
var color = (function () {
    var color = ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"];
    var range = ["5% - 8%", "8% - 11%", "11% - 14%", "14% - 17%", "17% - 20%", "> 20%"];
    return {
        getFillKey: function (percent) {
            if (percent >= 5 && percent <= 8) {
                return "5";
            } else if (percent <= 11) {
                return "8";
            } else if (percent <= 14) {
                return "11";
            } else if (percent <= 17) {
                return "14";
            } else if (percent <= 20) {
                return "17";
            } else {
                return "20";
            }
        },
        getColor: function (index) {
            return color[index];
        },
        getRange: function(index){
            return range[index];
        }
    }
})();