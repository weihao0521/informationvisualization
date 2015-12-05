/**
 * Created by Ian on 9/29/2015.
 */
var color = (function () {
    var color = ["#F8F9D0","#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"];
    var color_swing = ["#F8F9D0","#fdd49e", "#fc8d59", "#ef6548", "#d7301f", "#d7301f", "#990000"];
    /*var H_range = [" No Data Available", " 45% - 50%", " 50% - 55%", " 55% - 60%", " 60% - 65%", " 65% - 70%","Above 70%"];
    var S_range = [" No Data Available", " 10% - 15%", " 15% - 20%", " 20% - 30%", " 30% - 40%", " 40% - 50%"];*/

    var range= {
        Hillary: [45, 50, 55, 60, 65, 70],
        Sanders: [10, 15, 20, 30, 40, 50]
    }
    return {
        getFillKey: function (percent, candidate) {
            var rangeArray = range[candidate];
            for(var index = 0 ;index<rangeArray.length;index++){
                if(percent<=rangeArray[index]){
                    return index;
                }
            }
        },
        getFillKey2: function (percent) {
            if (percent >= 45 && percent <= 50) {
                return "46";
            } else if (percent <= 55) {
                return "51";
            } else if (percent <= 60) {
                return "56";
            } else if (percent <= 65) {
                return "61";
            } else if (percent <= 70) {
                return "66";
            } else {
                return "71";
            }
        },
        getColor: function (index,isSwing) {
            return isSwing?color_swing[index]:color[index];
        },
        getRange: function(index){
            return range[index];
        }
    };
})();