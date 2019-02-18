function hrefBack() {
    history.go(-1);
}

function decodeQuery(){
    var search = decodeURI(document.location.search);
    return search.replace(/(^\?)/, '').split('&').reduce(function(result, item){
        values = item.split('=');
        result[values[0]] = values[1];
        return result;
    }, {});
}

$(document).ready(function(){

    var url = location.search
    str = url.split('=')
    id = str[1]
    $.ajax({
        url:'/house/detail_info/'+ id + '/',
        dataType:'json',
        type:'GET',
        success:function(data){

            $('.house-price span').text(data.h_list.price)
            $('.house-title').text(data.h_list.title)
            $('.landlord-pic img').attr('src','/static/media/'+ data.h_list.user_avatar)
            $('.landlord-name span').text(data.h_list.user_name)

            $('.house-info-list li').text(data.h_list.address)

            $('#icon-house h3').text('出租'+ data.h_list.room_count + '间')
            $('#p_area').text('房屋面积:'+ data.h_list.acreage +'平米')
            $('#p_unit').text('房屋户型:'+ data.h_list.unit)

            $('#icon-user h3').text('宜住'+ data.h_list.capacity + '人')

            $('#icon-bed p').text(data.h_list.beds)

            $('#house-info').append('<li>收取押金<span>' + data.h_list.deposit +'</span></li>')
            $('#house-info').append('<li>最少入住天数<span>' + data.h_list.min_days + '</span></li>')
            if(data.h_list.max_days == 0){
                $('#house-info').append('<li>最多入住天数<span>无限制</span></li>')
            }
            else{
                $('#house-info').append('<li>最多入住天数<span>'+ data.h_list.max_days +'</span></li>')
            }

            $('.book-house').attr('href','/order/booking/?house_id='+ data.h_list.id)
            console.log(data.flag)
            if(data.flag == 0){
                console.log(data.flag)
                $(".book-house").show();
            }
            for(var i=0; i<data.h_list.facilities.length; i++){
                var fac = ''
                fac += '<li><span class="'+ data.h_list.facilities[i].css + '"></span>'+ data.h_list.facilities[i].name +'</li>'
                $('.house-facility-list').append(fac)
            }

            for(var i=0; i<data.h_list.images.length; i++){
                var image = ''
                image += '<li class="swiper-slide"><img src="/static/house_image/'+ data.h_list.images[i] + '"></li>'
                $('.swiper-wrapper').append(image)
            }

            var mySwiper = new Swiper ('.swiper-container', {
                loop: true,
                autoplay: 2000,
                autoplayDisableOnInteraction: false,
                pagination: '.swiper-pagination',
                paginationType: 'fraction'
            })

        },
        error:function(data){
            alert('Failed!')
        }
    })





})