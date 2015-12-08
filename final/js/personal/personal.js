var getCandidate;
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
    var candidates = {
        dem: ["Clinton", "Sanders"],
        rep: ["Trump", "Carson", "Rubio", "Cruz", "Bush"]
    };// filtered out some candidates
    var candidate = getCandidate();
    getParty = function () {
        if (candidates["dem"].indexOf(candidate) >= 0) {
            return "dem";
        } else if (candidates["rep"].indexOf(candidate) >= 0) {
            return "rep";
        }
    };
})();

// get portrait and introduction
(function () {
    $("#titleText").text(getCandidate());
    $("#portraitImg")
        .attr("src", "../../img/intro/" + getCandidate() + ".jpg")
        .attr("alt", getCandidate());

    //get introduction data
    d3.tsv("../../data/intro/CandidateIntroduction.tsv", function (error, data) {
        if (error) throw error;

        var intro;
        data.forEach(function (d) {
            if (d.candidate == getCandidate()) {
                intro = d.intro;
            }
        });
        $("#intro").text(intro);
    });
})();