var candidate;
// get portrait and introduction
(function () {
    var searchStr = location.search;
    if (!searchStr) {
        searchStr = "candidate=Clinton";
    }
    candidate = searchStr.split("=")[1];

    $("#portraitImg").attr("src","../img/intro/"+candidate+".jpg");

    //get introduction data
    d3.tsv("../data/intro/CandidateIntroduction.tsv", function (error, data) {
        if (error) throw error;

        var intro;
        data.forEach(function (d) {
            if (d.candidate == candidate) {
                intro = d.intro;
            }
        });
        $("#intro").text(intro);
    });
})();