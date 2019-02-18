//模态框居中的控制
function centerModals(){
    $('.modal').each(function(i){   //遍历每一个模态框
        var $clone = $(this).clone().css('display', 'block').appendTo('body');    
        var top = Math.round(($clone.height() - $clone.find('.modal-content').height()) / 2);
        top = top > 0 ? top : 0;
        $clone.remove();
        $(this).find('.modal-content').css("margin-top", top-30);  //修正原先已经有的30个像素
    });
}

function setStartDate() {
    var startDate = $("#start-date-input").val();
    if (startDate) {
        $(".search-btn").attr("start-date", startDate);
        $("#start-date-btn").html(startDate);
        $("#end-date").datepicker("destroy");
        $("#end-date-btn").html("离开日期");
        $("#end-date-input").val("");
        $(".search-btn").attr("end-date", "");
        $("#end-date").datepicker({
            language: "zh-CN",
            keyboardNavigation: false,
            startDate: startDate,
            format: "yyyy-mm-dd"
        });
        $("#end-date").on("changeDate", function() {
            $("#end-date-input").val(
                $(this).datepicker("getFormattedDate")
            );
        });
        $(".end-date").show();
    }
    $("#start-date-modal").modal("hide");
}

function setEndDate() {
    var endDate = $("#end-date-input").val();
    if (endDate) {
        $(".search-btn").attr("end-date", endDate);
        $("#end-date-btn").html(endDate);
    }
    $("#end-date-modal").modal("hide");
}

function goToSearchPage(th) {
    var url = "/house/search/?";

    var areaName = $(th).attr("area-name");
    var area_id = $(th).attr("area-id")
    var start_date = $(th).attr("start-date");
    var end_date = $(th).attr("end-date")

    url += ("aid=" + area_id);
    url += "&";


    if (undefined == areaName) areaName="";
    url += ("aname=" + areaName);
    url += "&";
    url += ("sd=" + start_date);
    url += "&";
    url += ("ed=" + end_date);
    url += "&";
    url += "sort=new"
    var sd = new Date(start_date);
    var ed = new Date(end_date);
    days = (ed - sd)/(1000*3600*24);
    if(area_id != '' && start_date != '' && end_date != '' && days != 0){
        location.href = url;
    }
    if(days == 0){
        alert('入住日期和离开日期不能相同')
    }

}

function check_login(){
   $.ajax({
        url:'/house/hindex/',
        dataType:'json',
        type:'GET',
        success:function(data){

//          判断是否登录
            if(data.code == '200'){
                $(".top-bar>.register-login").hide();
                $(".top-bar .user-info").show();
                $(".top-bar .user-info a").html(data.data);
            }
            if(data.code == '1003'){
                $(".top-bar>.register-login").show();
                $(".top-bar .user-info").hide();
            }

//          添加地区
            for(var i=0;i<data.area_list.length;i++){
                var area = ''
                area += '<a href="#" area-id="'+ data.area_list[i].id + '">'+ data.area_list[i].name +'</a>'
                $('.area-list').append(area)
            }

//          地区点击函数
            $(".area-list a").click(function(e){
                $("#area-btn").html($(this).html());
                $(".search-btn").attr("area-id", $(this).attr("area-id"));
                $(".search-btn").attr("area-name", $(this).html());
                $("#area-modal").modal("hide");
            });

//            添加图片
            for(var i=0;i<data.image_list.length;i++){
                console.log('图片')
                var image = ''
                image += '<div class="swiper-slide"><a href="/house/detail/?house_id='+ data.image_list[i].id + '">'
                image += '<img style="" src="/static/house_image/'+ data.image_list[i].image + '"></a>'
                image += '<div class="slide-title">'+ data.image_list[i].title + '</div></div>'
                $(".swiper-wrapper").append(image)
            }
            var mySwiper = new Swiper ('.swiper-container', {
                loop: true,
                autoplay: 2000,
                autoplayDisableOnInteraction: false,
                pagination: '.swiper-pagination',
                paginationClickable: true
            });


        },
        error:function(data){
            alert('error!')
        }
   })
}

$(document).ready(function(){
    check_login();


    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);               //当窗口大小变化的时候
    $("#start-date").datepicker({
        language: "zh-CN",
        keyboardNavigation: false,
        startDate: "today",
        format: "yyyy-mm-dd"
    });
    $("#start-date").on("changeDate", function() {
        var date = $(this).datepicker("getFormattedDate");
        $("#start-date-input").val(date);
    });
})