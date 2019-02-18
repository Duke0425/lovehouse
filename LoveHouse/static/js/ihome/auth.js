function showSuccessMsg() {
    $('.popup_con').fadeIn('fast', function() {
        setTimeout(function(){
            $('.popup_con').fadeOut('fast',function(){}); 
        },1000) 
    });
}

$(document).ready(function(){
    $.ajax({
        url:'/user/auths/',
        dataType:'json',
        type:'GET',
        success:function(data){

           if(data.code == 200){
                $('#real-name').val(data.data.id_name);
                $('#real-name').attr('disabled',true);
                $('#id-card').val(data.data.id_card);
                $('#id-card').attr('disabled',true);
                $('#button').hide();
           }
        },
        error:function(data){
            alert('Failed!')
        }
    })

    $('#form-auth').submit(function(e){
        e.preventDefault();
        $(this).ajaxSubmit({
            url:'/user/auth/',
            dataType:'json',
            type:'PATCH',
            success:function(data){
                if(data.code == 200){
                    alert('实名认证成功!')
                }
                if(data.code == 1001){
                    alert(data.msg)
                }
                if(data.code == 1002){
                    alert(data.msg)
                }
            },
            error:function(data){
                alert('Failed!')
            }
        })
    });


})