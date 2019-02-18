function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
    $.ajax({
        url:'/house/new_house_info/',
        dataType:'json',
        type:'GET',
        success:function(data){
            for(var i=0;i<data.area_list.length;i++){
                area = ''
                area += '<option value="'+data.area_list[i].id+'">'+data.area_list[i].name+'</option>'
                $('#area-id').append(area)
            }
        },

        error:function(data){
        }
    })




    $('#form-house-info').submit(function(e){
        e.preventDefault();
        $(this).ajaxSubmit({
            url:'/house/new_house/',
            type:'POST',
            dataType:'json',
            success:function(data){
                if(data.code == '200'){
                    $('#form-house-image').show()
                    $('#form-house-info').hide()
                    $('#house-id').val(data.data)
                }
            },
            error:function(data){
                alert('失败')
            }
        })
    })
    $('#form-house-image').submit(function(e){
        e.preventDefault();
        $(this).ajaxSubmit({
            url:'/house/new_house/',
            type:'PATCH',
            dataType:'json',
            success:function(data){
                if(data.code == '200'){
                    $('.house-image-cons').append('<img src="' + data.url + '">')
                }
            },
            error:function(data){
                alert('失败')
            }
        })
    })



})