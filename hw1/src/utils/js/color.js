/**
 * Created by Ian on 9/29/2015.
 */
function color(percent){
    if(percent>=5 && percent<=8){
        return "5";
    }else if (percent <=11){
        return "8";
    }else if(percent <=14){
        return "11";
    }else if(percent<=17){
        return "14";
    }else if(percent<=20){
        return "17";
    }else{
        return "20";
    }
}