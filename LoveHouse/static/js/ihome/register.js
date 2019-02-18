function getCookie(name) {
    var r = document.cookie.match("\\b" + name + "=([^;]*)\\b");
    return r ? r[1] : undefined;
}

var imageCodeId = "";

function generateUUID() {
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}


function generateImageCode() {
    // 获取验证码，并渲染页面
    $.ajax({
        url: '/user/code/',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            // 渲染验证码
            if(data.code == 200){
                 $('.image-code').text(data.data)
                // TODO: 将字符串生成图片
                // 前端生成验证码图片

            }
        }
    })
}

$(document).ready(function() {
    generateImageCode();
    $("#mobile").focus(function(){
        $("#mobile-err").hide();
    });
    $("#imagecode").focus(function(){
        $("#image-code-err").hide();
    });

    $("#password").focus(function(){
        $("#password-err").hide();
        $("#password2-err").hide();
    });
    $("#password2").focus(function(){
        $("#password2-err").hide();
    });
    $(".form-register").submit(function(e){
        e.preventDefault();
        mobile = $("#mobile").val();
        imageCode = $("#imagecode").val();
        passwd = $("#password").val();
        passwd2 = $("#password2").val();
        if (!mobile) {
            $("#mobile-err span").html("请填写正确的手机号！");
            $("#mobile-err").show();
            return;
        }
        if (!passwd) {
            $("#password-err span").html("请填写密码!");
            $("#password-err").show();
            return;
        }
        if (passwd != passwd2) {
            $("#password2-err span").html("两次密码不一致!");
            $("#password2-err").show();
            return;
        }
//        异步提交注册庆请求, ajax
        $.ajax({
            url:'/user/register/',
            type: 'POST',
            dataType: 'json',
            data:{'mobile':mobile, 'imageCode':imageCode,
            'passwd':passwd, 'passwd2':passwd2},
            success:function(data){
                if(data.code == 1002 ){
                    $('#mobile-err span').html(data.msg)
                    $('#mobile-err').show()
                }
                if(data.code == 1003 ){
                    $('#image-code-err span').html(data.msg)
                    $('#image-code-err').show()
                }
                if(data.code == 1004 ){
                    $('#password-err span').html(data.msg)
                    $('#password-err').show()
                }
                if(data.code == 1005 ){
                    $('#password2-err span').html(data.msg)
                    $('#password2-err').show()
                }
                if(data.code == 1001 ){
                    $('#password2-err span').html(data.msg)
                    $('#password2-err').show()
                }
                if(data.code == 200){
                    alert('注册成功!')
                    location.href = '/user/login/'
                }
            },
            error:function(data){
                alert('error!')
            }
        })
    });
})




