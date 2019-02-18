var cur_page = 1; // 当前页
var next_page = 1; // 下一页
var total_page = 1;  // 总页数
var house_data_querying = true;   // 是否正在向后台获取数据

// 解析url中的查询字符串
function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

// 更新用户点选的筛选条件
function updateFilterDateDisplay() {
    var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
    var $filterDateTitle = $(".filter-title-bar>.filter-title").eq(0).children("span").eq(0);
    if (startDate) {
        var text = startDate.substr(5) + "/" + endDate.substr(5);
        $filterDateTitle.html(text);
    } else {
        $filterDateTitle.html("入住日期");
    }
}


// 更新房源列表信息
// action表示从后端请求的数据在前端的展示方式
// 默认采用追加方式
// action=renew 代表页面数据清空从新展示
function updateHouseData(action) {
    var areaId = $(".filter-area>li.active").attr("area-id");
    if (undefined == areaId) areaId = "";
    var startDate = $("#start-date").val();
    var endDate = $("#end-date").val();
    var sortKey = $(".filter-sort>li.active").attr("sort-key");
    var params = {
        aid:areaId,
        sd:startDate,
        ed:endDate,
        sk:sortKey,
        p:next_page
    };
    //发起ajax请求，获取数据，并显示在模板中
}

$(document).ready(function(){
    url = location.search
    $.ajax({
        url:'/house/search_info/'+url,
        type:'GET',
        dataType:'json',
        success:function(data){


            if(data.sort == 'new'){
                $("#this").text('最新上线')
            }
            if(data.sort == 'booking'){
                $("#this").text('入住最多')
            }
            if(data.sort == 'price-inc'){
                $("#this").text('价格 高到低')
            }
            if(data.sort == 'price-des'){
                $("#this").text('价格 低到高')
            }

//            添加指定的房源
            for(var i=0;i<data.h_list.length;i++){
                var house = ''
                house += '<li class="house-item"><a href="/house/detail/?house_id=' +data.h_list[i].id + '">'
                house += '<img src="/static/house_image/' +data.h_list[i].image + '"></a>'
                house += '<div class="house-desc"><div class="landlord-pic">'
                house += '<img src="/static/images/landlord01.jgp"></div>'
                house += '<div class="house-price">￥<span>' + data.h_list[i].price + '</span>/晚</div>'
                house += '<div class="house-intro"><span class="house-title">' + data.h_list[i].title + '</span>'
                house += '<em>出租' + data.h_list[i].room + '间 - '+ data.h_list[i].order_count +'次入住 - '+ data.h_list[i].address+'</em></div></div> </li>'

                $('.house-list').append(house)
            }

//            添加地区
            for(var i=0;i<data.a_list.length;i++){
                area = ''
                area += '<li area-id="'+data.a_list[i].id +'">' + data.a_list[i].name+ '</li>'
                $('.filter-item-bar>.filter-area').append(area)
            }


            $(".filter-item-bar>.filter-area").on("click", "li", function(e) {
                if (!$(this).hasClass("active")) {
                    $(this).addClass("active");
                    $(this).siblings("li").removeClass("active");
                    $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html($(this).html());
                } else {
                    $(this).removeClass("active");
                    $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html("位置区域");
            }




    });

        },
        error:function(data){
            alert('Failed!')
        },

    })

//   更换区域的点击函数
    $(".filter-item-bar>.filter-area").on("click", "li", function(e) {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).siblings("li").removeClass("active");
            $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html($(this).html());

            var area_id = $(this).attr('area-id')
            var area_name = $(this).html()

            search_url = location.search
            o_aid = search_url.split('&')[0].split('=')[1]
            o_aname = search_url.split('&')[1].split('=')[1]
            url = search_url.replace('aid=' + o_aid, 'aid=' + area_id)
            url = url.replace('aname=' + o_aname, 'aname=' + area_name)

            location.href = url

        } else {
            $(this).removeClass("active");
            $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html("位置区域");
        }
    });


// 更换方式(点击函数)

    $(".filter-item-bar>.filter-sort").on("click", "li", function(e) {
        if (!$(this).hasClass("active")) {
            $(this).addClass("active");
            $(this).siblings("li").removeClass("active");
            $("#this").text($(this).text());
            alert($(this).text())
            var sort_key = $(this).attr('sort-key')
            var sk = location.search.split('&sort=')[1]
            location.href = location.search.replace('&sort=' + sk, '&sort=' + sort_key)

        }
    })



    var queryData = decodeQuery();
    var startDate = queryData["sd"];
    var endDate = queryData["ed"];
    $("#start-date").val(startDate);
    $("#end-date").val(endDate);
    updateFilterDateDisplay();
    var areaName = queryData["aname"];
    if (!areaName) areaName = "位置区域";
    $(".filter-title-bar>.filter-title").eq(1).children("span").eq(0).html(areaName);

    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    var $filterItem = $(".filter-item-bar>.filter-item");
    $(".filter-title-bar").on("click", ".filter-title", function(e){
        var index = $(this).index();
        if (!$filterItem.eq(index).hasClass("active")) {
            $(this).children("span").children("i").removeClass("fa-angle-down").addClass("fa-angle-up");
            $(this).siblings(".filter-title").children("span").children("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            $filterItem.eq(index).addClass("active").siblings(".filter-item").removeClass("active");
            $(".display-mask").show();
        } else {
            $(this).children("span").children("i").removeClass("fa-angle-up").addClass("fa-angle-down");
            $filterItem.eq(index).removeClass('active');
            $(".display-mask").hide();
            updateFilterDateDisplay();
        }
    });
    $(".display-mask").on("click", function(e) {
        $(this).hide();
        $filterItem.removeClass('active');
        updateFilterDateDisplay();
        cur_page = 1;
        next_page = 1;
        total_page = 1;
        updateHouseData("renew");

    });


})