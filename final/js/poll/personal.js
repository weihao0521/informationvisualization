var getCandidate;
var getFullName;
var getParty;

// initialize get function of candidate
(function () {
    var searchStr = location.search;
    if (!searchStr) {
        searchStr = "candidate=Clinton";
    }
    var candidate = searchStr.split("=")[1];
    getCandidate = function () {
        return candidate;
    };
    getCandidate = getCandidate.bind(this);
})();

// initialize get function of party
(function () {
    var fullName = {
        dem: {
            Clinton: "Hillary Cliton",
            Sanders: "Bernie Sanders"
        },
        rep: {
            Trump: "Donald Trump",
            Carson: "Ben Carson",
            Cruz: "Ted Cruz",
            Rubio: "Marco Rubio",
            Bush: "Jeb Bush"
        }
    };// filtered out some candidates

    var candidates = {
        dem: ["Clinton", "Sanders"],
        rep: ["Trump", "Carson", "Rubio", "Cruz", "Bush"]
    };

    var candidate = getCandidate();
    getParty = function () {
        if (candidates["dem"].indexOf(candidate) >= 0) {
            return "dem";
        } else if (candidates["rep"].indexOf(candidate) >= 0) {
            return "rep";
        }
    };
    getFullName = function () {
        return fullName[getParty()][getCandidate()];
    }
    getFullName = getFullName.bind(this);
})();

// get portrait and introduction
(function () {
    $("#titleText").text(getFullName());
    $("#portraitImg")
        .attr("src", "../../img/intro/" + getCandidate() + ".jpg")
        .attr("alt", getCandidate());

    //get introduction data
    d3.tsv("../../data/intro/CandidateIntroduction.tsv", function (error, data) {
        if (error) throw error;

        var intro;
        var des1="1",des2="2",des3="3";
        data.forEach(function (d) {
            if (d.candidate == getCandidate()) {
                intro = d.intro;
                des1= d.des1;
                des2= d.des2;
                des3= d.des3;
            }
        });
        $("#intro").html(intro);
        $("#des1").html(des1);
        $("#des2").html(des2);
        $("#des3").html(des3);
    });
})();