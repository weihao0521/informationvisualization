/**
 * Created by Ian on 9/29/2015.
 */
var color = (function () {
    var color = ["#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"];
    var range = ["10 - 15%", "15% - 20%", "20% - 30%", "30% - 40%", "40% - 50%"];
    return {
        getFillKey: function (percent) {
            if (percent >= 10 && percent <= 15) {
                return "10";
            } else if (percent <= 20) {
                return "15";
            } else if (percent <= 30) {
                return "20";
            } else if (percent <= 40) {
                return "30";
            } else if (percent <= 50) {
                return "40";
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