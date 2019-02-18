function hrefBack() {
    history.go(-1);
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

function showErrorMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(document).ready(function(){

    var url = location.search
    str = url.split('=')
    id = str[1]
    $.ajax({
        url:'/order/booking_info/'+ id + '/',
        dataType:'json',
        type:'GET',
        success:function(data){
            $('.house-info img').attr('src','/static/house_image/'+ data.h_list.image)
            $('.house-info h3').text(data.h_list.title)
            $('.house-info p span').text(data.h_list.price)

        },
        error:function(data){
            alert('Fail!')
        }
    })

    $('.submit-btn').click(function(){
//        获取起始日期和结束日期
        var start_date = $('#start-date').val()
        var end_date = $('#end-date').val()
//        计算天数
        var sd = new Date(start_date);
        var ed = new Date(end_date);
        days = (ed - sd)/(1000*3600*24);

        var price = $(".house-text>p>span").html();
        var amount = days * parseFloat(price);

        data = {'start_date':start_date,'end_date':end_date,'house_id':id,'days':days,'amount':amount}
        if (days>0){
            $.ajax({
                url:'/order/orders/',
                type:'POST',
                dataType:'json',
                data:data,
                success:function(data){
                if(data.code == 200){
                    location.href = '/order/orders/'
                }
                if(data.code == 1001){
                    alert('该房间在 '+data.data.begin_date+'---'+data.data.end_date+' 已被预订')
                }

                }

            })
        }

    })

    $(".input-daterange").datepicker({
        format: "yyyy-mm-dd",
        startDate: "today",
        language: "zh-CN",
        autoclose: true
    });
    $(".input-daterange").on("changeDate", function(){
        var startDate = $("#start-date").val();
        var endDate = $("#end-date").val();

        if (startDate && endDate && startDate > endDate) {
            showErrorMsg();
        } else {
            var sd = new Date(startDate);
            var ed = new Date(endDate);
            days = (ed - sd)/(1000*3600*24);
            var price = $(".house-text>p>span").html();
            var amount = days * parseFloat(price);
            $(".order-amount>span").html(amount.toFixed(2) + "(共"+ days +"晚)");
        }
    });
})
