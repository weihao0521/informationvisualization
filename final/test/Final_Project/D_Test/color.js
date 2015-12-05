/**
 * Created by Ian on 9/29/2015.
 */
var color = (function () {
    var D_color = ["#F8F9D0","#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"];
    var R_color = ["#F8F9D0","#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"];
    var color_swing = ["#F8F9D0","#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"];
    var H_range = [" No Data Available", " Less than 50%", " 50% - 55%", " 55% - 60%", " 60% - 65%", " 65% - 70%","70% - 75%"];
    var S_range = [" No Data Available", " Less than 15%", " 15% - 20%", " 20% - 25%", " 20% - 30%", " 30% - 40%", " 40% - 50%"];
    var T_range = [" No Data Available", " Less than 20%", " 20% - 23%", " 23% - 25%", " 25% - 28%", " 28% - 30%", " 30% - 40%"];
    var C_range = [" No Data Available", " Less than 5%", " 5% - 8%", " 8% - 14%", " 14% - 18%", " 18% - 25%", " 25% - 30%"];
    var BC_range = [" No Data Available", " Less than 5%", " 5% - 10%", " 10% - 15%", " 15% - 20%", " 20% - 25%", " 25% - 35%"];
    var B_range = [" No Data Available", " Less than 2%", " 2% - 4%", " 4% - 6%", " 6% - 8%", " 8% - 10%", " 10% - 12%"];
    var R_range = [" No Data Available", " Less than 10%", " 10% - 12%", " 12% - 14%", " 14% - 16%", " 16% - 18%", " 18% - 20%"];

    var range= {
        Hillary: [45, 50, 55, 60, 65, 75],
        Sanders: [15, 20, 25, 30, 40, 50],
        Trump:   [20, 23, 25, 28, 30, 40],
        Cruz:    [ 5,  8, 14, 18, 25, 30],
        Carson:  [ 5, 10, 15, 20, 25, 35],
        Bush:    [ 2,  4,  6,  8, 10, 12],
        Rubio:   [10, 12, 14, 16, 18, 20]
    }
    return {
        getFillKey: function (percent, candidate, party) {
            var rangeArray = range[candidate];
            if(party == "D") {
                for (var index = 0; index < rangeArray.length; index++) {
                    if (percent <= rangeArray[index]) {
                        return index;
                    }
                }
            }
            else if (party == "R"){
                for (var index = 0; index < rangeArray.length; index++) {
                    if (percent <= rangeArray[index]) {
                        return index+20;
                    }
                }
            }
        },
        getFillKey2: function (percent, candidate) {
            var rangeArray = range[candidate];
            for(var index = 0 ;index<rangeArray.length;index++){
                if(percent<=rangeArray[index]){
                    return index+10;
                }
            }
        },
        getColor: function (index,isSwing) {
            if(isSwing == true){
                return color_swing[index];
            }
            else if(party == "D"){
                return D_color[index];
            }
            else if(party == "R"){
                return R_color[index];
            }
        },
        getRange: function(index, candidate){
            if(candidate == "Hillary"){
                return H_range[index];
            }
            if(candidate == "Sanders"){
                return S_range[index];
            }
            if(candidate == "Trump"){
                return T_range[index];
            }
            if(candidate == "Cruz"){
                return C_range[index];
            }
            if(candidate == "Carson"){
                return BC_range[index];
            }
            if(candidate == "Bush"){
                return B_range[index];
            }
            if(candidate == "Rubio"){
                return R_range[index];
            }
        }
    };
})();