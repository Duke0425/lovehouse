function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

$(document).ready(function(){
    $('#form-avatar').submit(function (e){
        e.preventDefault();
        $(this).ajaxSubmit({
            url:'/user/profile/',
            dataType:'json',
            type:'PATCH',
            success:function(data){
                if(data.code == '200'){
                    alert('头像设置成功')
                    $('#user-avatar').attr('src',data.url)
                }
                if(data.code == '1004'){
                    alert(data.msg)
                }
                if(data.code == '1003'){
                    alert(data.msg)
                }
            },
            error:function(data){

                alert('Failed')
            }
        })
    });

    $('#form-name').submit(function(e){
        e.preventDefault()
        $(this).ajaxSubmit({
            url:'/user/profile/',
            type:'PATCH',
            dataType:'json',
            success:function(data){
                if(data.code == 200 ){
                    alert('用户名更改成功!')
                }
                if(data.code == 1001 ){
                    alert(data.msg)
                }
                if(data.code == 1002 ){
                    $('.error-msg').show()
                }
            },
            error:function(data){
                alert('请求失败')
            }
        });
    });
});



