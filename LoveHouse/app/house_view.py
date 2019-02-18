import os
import re
import uuid

from flask import Blueprint, request, render_template, session, jsonify
from flask_login import login_required

from app.models import User, House, Facility, HouseImage, Area, Order

house_blue = Blueprint('house',__name__)

@house_blue.route('/index/',methods=['GET'])
def index():
    """
    渲染主页
    :return:
    """
    return render_template('index.html')


@house_blue.route('/hindex/',methods=['GET'])
def hindex():
    """
    用户登录状态
    :return:
    """
    user_id = session.get('user_id')
    areas = Area.query.all()
    area_list = []
    image_list= []
    houses = House.query.all()[-3:]
    for house in houses:
        image_list.append(house.to_dict())
    for area in areas:
        area_list.append(area.to_dict())
    if user_id:
        user = User.query.filter_by(id=user_id).first()
        return jsonify({'code':200,'msg':'请求成功','data':user.name,'area_list':area_list,'image_list':image_list})
    return jsonify({'code':1003,'msg':'用户未登录','area_list':area_list,'image_list':image_list})


@house_blue.route('/my_house/',methods=['GET'])
@login_required
def my_house():
    """
    我的房源
    :return:
    """

    return render_template('myhouse.html')


@house_blue.route('/auth_status/',methods=['GET'])
def auth_status():
    """
    我的房源 -- 实名登录状态
    :return:
    """
    user_id = session['user_id']
    user = User.query.get(user_id)

    if user.id_name:
        houses = House.query.filter_by(user_id=user_id)
        h_list = []
        for house in houses:
            h_list.append(house.to_dict())
        return jsonify({'code':200,'msg':'已实名认证!','h_list':h_list})
    return jsonify({'code':1001,'msg':'未实名认证!'})


@house_blue.route('/new_house/',methods=['GET'])
@login_required
def new_house():
    """
    发布房源
    :return:
    """
    return render_template('newhouse.html')


@house_blue.route('/new_house_info/',methods=['GET'])
@login_required
def new_house_info():
    """
    发布房源内容请求
    :return:
    """
    area_list = []
    areas = Area.query.all()
    for area in areas:
        area_list.append(area.to_dict())
    return jsonify({'code':200,'msg':'请求成功','area_list':area_list})


@house_blue.route('/new_house/',methods=['POST'])
@login_required
def add_house():
    """
    添加新房源
    :return:
    """
    house = House()
    facilities = request.form.getlist('facility')
    if facilities:
        for facility_id in facilities:
            facility = Facility.query.get(facility_id)
            house.facilities.append(facility)

    house.user_id = session['user_id']
    house.title = request.form.get('title')
    house.price = request.form.get('price')
    house.area_id = request.form.get('area_id')
    house.address = request.form.get('address')
    house.room_count = request.form.get('room_count')
    house.acreage = request.form.get('acreage')
    house.unit = request.form.get('unit')
    house.capacity = request.form.get('capacity')
    house.beds = request.form.get('beds')
    house.deposit = request.form.get('deposit')
    house.min_days = request.form.get('min_days')
    house.max_days = request.form.get('max_days')
    house.add_update()
    return jsonify({'code':200,'msg':'请求成功!','data':house.id})


@house_blue.route('/new_house/',methods=['PATCH'])
@login_required
def add_house_picture():
    """
    添加新房屋图片
    :return:
    """
    image = request.files.get('house_image')
    house_id = request.form.get('house_id')
    house = House.query.get(house_id)

    if not re.match(r'image/*', image.mimetype):
        return jsonify({'code': 1004, 'msg': '请上传图片格式的文件'})

    # 获取地址:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    STATIC_DIR = os.path.join(BASE_DIR, 'static')
    IMAGE_DIR = os.path.join(STATIC_DIR, 'house_image')

    # 生成随机图片名 并保存到/static/house_image/路径下
    filename = str(uuid.uuid4())
    a = image.mimetype.split('/')[-1:][0]
    name = filename + '.' + a
    path = os.path.join(IMAGE_DIR, name)
    image.save(path)

    # 保存房屋图片字段:
    house_image = HouseImage()
    house_image.house_id = house_id
    house_image.url = name
    house_image.add_update()

    # 存储房屋主页图片
    if not house.index_image_url:
        house.index_image_url = name
        house.add_update()
    return jsonify({'code':200,'msg':'请求成功!','url':'/static/house_image/'+ house_image.url})


@house_blue.route('/detail/',methods=['GET'])
def house_detail():
    """
    房屋详情
    :return:
    """
    return render_template('detail.html')

@house_blue.route('/detail_info/<int:id>/',methods=['GET'])
def house_detail_info(id):
    """
    房屋详情页面,加载数据!
    :return:
    """
    house = House.query.get(id)
    areas = Area.query.all()

    h_list = house.to_full_dict()
    user_id = session.get('user_id')
    flag = 0

    if user_id:
        if house.user_id == int(user_id):
            flag = 1

    return jsonify({'code':200,'msg':'请求成功','h_list':h_list,'flag':flag})


@house_blue.route('/search/',methods=['GET'])
def search():
    """
    搜索页面
    :return:
    """
    return render_template('search.html')


@house_blue.route('/search_info/',methods=['GET'])
def search_info():
    """
    搜索页面内容请求
    :return:
    """
    print(request.args)
    aid = request.args.get('aid')
    s_date = request.args.get('sd')
    e_date = request.args.get('ed')
    sort = request.args.get('sort')



    # 不在选择区间的已完成或者待接单的订单
    order1 = Order.query.filter(Order.end_date > s_date,Order.begin_date <= s_date,Order.status != 'REJECTED').all()
    order2 = Order.query.filter(Order.end_date >= e_date,Order.begin_date <= e_date,Order.status != 'REJECTED').all()


    # 在选择区间内的待接单和已完成的订单
    # 所有的订单 和 房屋
    house1 = House.query.all()

    # 不能预订的房源id
    f_house_id = []
    for order in order1:
        f_house_id.append(order.house_id)
    for order in order2:
        f_house_id.append(order.house_id)



    house_id = []
    for house in house1:
        if house.id not in f_house_id:
            house_id.append(house.id)


    # 获取到有效的房屋id值 并去重
    houses_id = list(set(house_id))
    # 获取

    area = Area.query.get(aid)
    # 最新上线
    if sort == 'new':
        houses = House.query.filter(House.id.in_(houses_id),House.area_id == area.id).order_by('-id').all()
    # 做多入住
    if sort == 'booking':
        houses = House.query.filter(House.id.in_(houses_id), House.area_id == area.id).order_by('-order_count').all()
    # 房屋价格从低到高
    if sort == 'price-inc':
        houses = House.query.filter(House.id.in_(houses_id), House.area_id == area.id).order_by('price').all()
    # 房屋价格从高到低
    if sort == 'price-des':
        houses = House.query.filter(House.id.in_(houses_id), House.area_id == area.id).order_by('-price').all()


    h_list = []
    for house in houses:
        h_list.append(house.to_dict())

    areas = Area.query.all()
    a_list = []
    for area in areas:
        a_list.append(area.to_dict())
    return jsonify({'code': 200, 'msg': '请求成功!', 'h_list': h_list, 'a_list': a_list,'sort':sort})

