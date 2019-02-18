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

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
       $.ajax({
        url:'/order/orders_info/',
        dataType:'json',
        type:'GET',
        success:function(data){
            for(var i=0; i<data.o_list.length; i++){
                var info = ''
                var stas = data.o_list[i].status
                console.log(data.o_list[i].comment)
                info += '<li order-id="' + data.o_list[i].order_id + '">'
                info += '<div class="order-title"><h3>订单编号：' + data.o_list[i].order_id +
                '</h3><div class="fr order-operate">'
                if(data.status[stas] == '已完成' && data.o_list[i].comment == null){
                    info += '<button type="button" class="btn btn-success order-comment" data-toggle="modal" data-target="#comment-modal">发表评价</button>'
                }
                info += '</div></div><div class="order-content"><img src="/static/house_image/'+ data.o_list[i].image + '">'
                info += '<div class="order-text"><h3>'+ data.o_list[i].house_title +'</h3><ul>'
                info += '<li>创建时间：' + data.o_list[i].create_date + '</li>'
                info += '<li>入住日期：' + data.o_list[i].begin_date + '</li>'
                info += '<li>离开日期：' + data.o_list[i].end_date + '</li>'
                info += '<li>合计金额：' + data.o_list[i].amount + '</li>'
                info += '<li>订单状态：<span>' + data.status[stas] + '</span></li>'
                if(data.status[stas] == '已完成' && data.o_list[i].comment != null ){
                    info += '<li>我的评价：' + data.o_list[i].comment+ '</li>'
                }
                info += '</ul></div></div></li>'
                $('#order-list').append(info)
            }
        },
        error:function(data){
            alert('Fail!')
        }
    })


    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);
    $(".order-comment").on("click", function(){
        var orderId = $(this).parents("li").attr("order-id");
    });

    $(".modal-comment").click(function(){
        var orderId = $('.order-comment').parents("li").attr("order-id");
        var comment = $('#comment').val()
        $.ajax({
            url:'/order/orders_comment/',
            type:'PATCH',
            dataType:'json',
            data:{'order_id':orderId,'comment':comment},
            success:function(data){
                if(data.code == 200){
                    alert('Success!')
                    location.reload()
                }
                if(data.code == 1001){
                    alert(data.msg)
                }

            },
            error:function(data){
                alert('Error!')
            }
        })
    })
});