import os
import re, random
import uuid

from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for
from flask_login import login_user, logout_user, login_required, LoginManager

from app.models import User, db
from utils import status_code

login_manager = LoginManager()
login_manager.login_view = 'user.login'

user_blue = Blueprint('user',__name__)

@user_blue.route('/register/', methods=['GET'])
def register():
    """
    用户注册
    :return:
    """
    return render_template('register.html')


@user_blue.route('/register/',methods=['POST'])
def register_check():
    """
    注册校验
    :return:
    """
    """
    获取参数
    1.验证参数是否都填写了
    2.验证手机号
    3.验证图片验证码 session值
    4.密码和确认密码是否一致
    
    5.验证手机号是否被注册
    创建注册信息
    """
    try:
        mobile = request.form['mobile']
        passWord = request.form['passwd']
        passWord2 = request.form['passwd2']
        imageCode = request.form['imageCode']
        #可以使用all([mobile,imageCode,passWord,passWord2]) 判断
    except:
        return jsonify({'code':1001, 'msg':'请填写完整的参数'})

    if not re.match(r'^1[3456789]\d{9}$', mobile):
        return jsonify({'code':1002,'msg':'电话号码错误'})
    if imageCode != session.get('img_code'):
        return jsonify({'code':1003,'msg':'验证码错误'})
    if passWord != passWord2:
        return jsonify({'code':1004,'msg':'密码不一致'})
    if User.query.filter_by(phone=mobile).first():
        return jsonify({'code':1005,'msg':'用户已存在'})
    user = User()
    user.phone = mobile
    user.name = mobile
    user.password = passWord
    user.add_update()
    return jsonify({'code': 200, 'msg': '请求成功'})


@user_blue.route('/code/',methods=['GET'])
def get_code():
    """
    随机图片验证码
    :return:
    """

    """
    获取验证码
    方式1:后端生成图片,并返回验证码图片的地址()
    方式2:后端只生成随机参数,返回给页面,页面中在生成图片(前端做)
    """
    s = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
    code = ''
    for i in range(4):
        code += random.choice(s)
    session['img_code'] = code
    return jsonify({'code':200,'msg':'请求成功','data':code})


@user_blue.route('/login/', methods=['GET'])
def login():
    """
    用户登录
    :return:
    """
    return render_template('login.html')


@user_blue.route('/login/', methods=['POST'])
def login_check():
    """
    登录校验
    :return:
    """
    try:
        mobile = request.form['mobile']
        passwd = request.form['passwd']
    except:
        return jsonify({'code':1001,'msg':'请填写完整参数'})
    user = User.query.filter_by(phone=mobile).first()
    if not user:
        return jsonify({'code':1006,'msg':'用户不存在'})
    if not user.check_pwd(passwd):
        return jsonify({'code':1007, 'msg':'密码错误'})
    login_user(user)
    return jsonify({'code':200,'msg':'请求成功'})


@user_blue.route('/my/',methods=['GET'])
@login_required
def my():
    """
    个人信息界面
    :return:
    """
    return render_template('my.html')


@login_manager.user_loader
def load_user(user_id):
    """
    回调函数
    :param user_id:
    :return:
    """
    # 定义被login_manage装饰的回调函数
    # 返回的是当前登录系统的用户对象
    return User.query.filter(User.id==user_id).first()


@user_blue.route('/logout/',methods=['GET'])
@login_required
def logout():
    """
    退出登录
    :return:
    """
    logout_user()
    return redirect(url_for('user.login'))




@user_blue.route('/profile/',methods=['GET'])
@login_required
def profile():
    """
    修改个人信息
    :return:
    """
    return render_template('profile.html')


@user_blue.route('/profile/',methods=['PATCH'])
@login_required
def profile_avatar():
    """

    添加头像和用户名
    :return:
    """
    user_id = session['user_id']
    user = User.query.get(user_id)
    form = request.form
    files = request.files
    if 'name' in form:
        name = request.form.get('name')
        if not name:
            return jsonify({'code':1001,'msg':'用户名不能为空'})
        if User.query.filter_by(name=name).first():
            return jsonify({'code':1002,'msg':'姓名已存在'})
        user.name = name
        user.add_update()
        return jsonify({'code':200,'msg':'请求成功'})
    if 'avatar' in form:
        return jsonify({'code':1003,'msg':'图片不能为空'})
    if 'avatar' in files:
        avatar = request.files.get('avatar')

        # 验证文件是图片的格式
        if not re.match(r'image/*',avatar.mimetype):
            return jsonify({'code':1004,'msg':'请上传图片格式的文件'})

        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # 获取地址
        STATIC_DIR = os.path.join(BASE_DIR,'static')

        MEDIA_DIR = os.path.join(STATIC_DIR,'media')
        filename = str(uuid.uuid4())
        a = avatar.mimetype.split('/')[-1:][0]
        name = filename + '.'+ a
        path = os.path.join(MEDIA_DIR,name)
        avatar.save(path)

        # 保存头像字段:

        user.avatar = name
        user.add_update()
        return jsonify({'code':200,'msg':'请求成功','url':'/static/media/' + user.avatar})


@user_blue.route('/auth/',methods=['GET'])
@login_required
def auth():
    """
    实名认证
    :return:
    """
    return render_template('auth.html')


@user_blue.route('/auth/',methods=['PATCH'])
@login_required
def auth_addInfo():
    """
    添加实名认证信息
    :return:
    """
    real_name = request.form.get('real_name')
    id_card = request.form.get('id_card')
    if not all([real_name,id_card]):
        return jsonify({'code':1001,'msg':'参数错误'})
    if not re.match(r'^[1-9]\d{17}$',id_card):
        return jsonify({'code':1002,'msg':'身份证号码错误'})
    user = User.query.get(session['user_id'])
    user.id_card = id_card
    user.id_name = real_name
    user.add_update()
    return jsonify({'code':200,'msg':'请求成功!'})


@user_blue.route('/auths/',methods=['GET'])
@login_required
def auth_info():
    """
    显示实名认证信息
    :return:
    """
    user = User.query.get(session['user_id'])
    if all([user.id_name,user.id_card]):
        return jsonify({'code':200,'msg':'请求成功!','data':user.to_auth_dict()})
    return jsonify({'code':1001,'msg':'未实名认证!'})


