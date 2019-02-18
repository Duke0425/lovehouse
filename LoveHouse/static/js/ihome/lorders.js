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
        url:'/order/lorders_info/',
        type:'GET',
        dataType:'json',
        success:function(data){
            if(data.code == 200){
                for(var i=0; i<data.c_list.length; i++){
                    var info = ''
                    var stas = data.c_list[i].status

                    info += '<li order-id="' + data.c_list[i].order_id + '">'
                    info += '<div class="order-title"><h3>订单编号：' + data.c_list[i].order_id + '</h3><div class="fr order-operate">'

                    if(data.status[stas] == '待接单'){
                        info += '<button type="button" class="btn btn-success order-accept" data-toggle="modal" data-target="#accept-modal">接单</button>'
                        info += '<button type="button" class="btn btn-danger order-reject" data-toggle="modal" data-target="#reject-modal">拒单</button>'
                    }

                    info += '</div></div><div class="order-content"><img src="/static/house_image/'+ data.c_list[i].image + '">'
                    info += '<div class="order-text"><h3>'+ data.c_list[i].house_title +'</h3><ul>'
                    info += '<li>创建时间：' + data.c_list[i].create_date + '</li>'
                    info += '<li>入住日期：' + data.c_list[i].begin_date + '</li>'
                    info += '<li>离开日期：' + data.c_list[i].end_date + '</li>'
                    info += '<li>合计金额：' + data.c_list[i].amount + '</li>'
                    info += '<li id="' + 'status_'+ data.c_list[i].order_id + '">订单状态：<span>' + data.status[stas] + '</span></li>'
                    if(data.status[stas] == "已拒单" ){
                        info += '<li>拒单原因：无 </li>'
                    }
                    info += '</ul></div></div></li>'
                    $('#order-list').append(info)
                }
            }
            if(data.code == 1001){
                alert(data.msg)
            }
        },
        error:function(data){
            alert('Failed!')
        }

    })

    $('.modal').on('show.bs.modal', centerModals);      //当模态框出现的时候
    $(window).on('resize', centerModals);
    $(".order-accept").on("click", function(){
        var orderId = $(this).parents("li").attr("order-id");
//        $(".modal-accept").attr("order-id", orderId);

    });
    $(".order-reject").on("click", function(){
        var orderId = $(this).parents("li").attr("order-id");
        $(".modal-reject").attr("order-id", orderId);
    });

    $(".modal-accept").click(function(){
        var orderId = $('.order-accept').parents("li").attr("order-id");
        $.ajax({
            url:'/order/lorders_info/',
            type:'PATCH',
            dataType:'json',
            data:{'order_id':orderId,'code':'accept'},
            success:function(data){
                alert('Success!')
                location.reload()
            },
            error:function(data){
                alert('Error!')
            }
        })
    })

    $(".modal-reject").click(function(){
        var orderId = $('.order-reject').parents("li").attr("order-id");
        $.ajax({
            url:'/order/lorders_info/',
            type:'PATCH',
            dataType:'json',
            data:{'order_id':orderId,'code':'reject'},
            success:function(data){
                alert('Success!')
                location.reload()
            },
            error:function(data){
                alert('Error!')
            }
        })
    })
});