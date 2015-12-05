var getCandidate;

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

// get portrait and introduction
(function () {
    $("#titleText").text(getCandidate());
    $("#portraitImg")
        .attr("src", "../img/intro/" + getCandidate() + ".jpg")
        .attr("alt", getCandidate());

    //get introduction data
    d3.tsv("../data/intro/CandidateIntroduction.tsv", function (error, data) {
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