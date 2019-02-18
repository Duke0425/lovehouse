$(document).ready(function(){
    $.ajax({
        url:'/house/auth_status/',
        type:'GET',
        dataType:'json',
        success:function(data){
            console.log(data)
            if(data.code == 200){
                $(".auth-warn").hide();
                for(var i=0; i<data.h_list.length; i++){
                    var h_li = ''
                    h_li += '<li><a href="/house/detail/?house_id=' + data.h_list[i].id + '"><div class="house-title">'
                    h_li += '<h3>房屋ID:'+ data.h_list[i].id +' —— ' + data.h_list[i].title + '</h3></div>'
                    h_li += '<div class="house-content">'
                    h_li += '<img src="/static/house_image/' + data.h_list[i].image +  '" >'
                    h_li += '<div class="house-text"><ul>'
                    h_li += '<li>位于：' + data.h_list[i].area + '</li>'
                    h_li += '<li>价格：￥' + data.h_list[i].price + '/晚</li>'
                    h_li += '<li>发布时间：' + data.h_list[i].create_time + '</li>'
                    h_li += '</ul></div></div></a></li>'
                    $('#houses-list').append(h_li)
                }


            }
            if(data.code == 1001){
                $(".auth-warn").show();
            }
        },
        error:function(data){

        }

    })

})