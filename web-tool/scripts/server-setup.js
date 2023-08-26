
$.ajax({
    url: 'http://127.0.0.1:8080/',
    success: function (xml) {
        $(xml).find('Tab').each(function () {
            var id = $(this).attr('URL');
            var tab = $(this).attr('TabName');
            $("ul").append("<li><a href=" + id + ">" + tab + "</li>");
        });
    }
});