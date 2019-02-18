
from flask import Blueprint, render_template, jsonify, request, session
from flask_login import login_required

from app.models import House, Order

order_blue = Blueprint('order', __name__)

@order_blue.route('/orders/',methods=['GET'])
@login_required
def orders():
    """
    我的订单
    :return:
    """
    return render_template('orders.html')


@order_blue.route('/orders_info/',methods=['GET'])
@login_required
def orders_info():
    """
    我的订单内容渲染(ajax)
    :return:
    """
    status = {
        'WAIT_ACCEPT':'待接单',
        'WAIT_PAYMENT': '待支付',
        'PAID': '已支付',
        'WAIT_COMMENT': '待评价',
        'COMPLETE': '已完成',
        'CANCELED': '已取消',
        'REJECTED': '已拒单'
    }
    orders = Order.query.filter_by(user_id=session['user_id']).all()
    o_list = []
    for order in orders:
        o_list.append(order.to_dict())
    return jsonify({'code':200,'msg':'请求成功','o_list':o_list,'status':status})


@order_blue.route('/orders/',methods=['POST'])
@login_required
def add_orders():
    """
    添加订单
    :return:
    """
    s_date = request.form.get('start_date')
    e_date = request.form.get('end_date')
    h_id = request.form.get('house_id')
    days = request.form.get('days')


    # 不在选择区间的已完成或者待接单的订单
    order1 = Order.query.filter(Order.end_date > s_date, Order.begin_date <= s_date, Order.status != 'REJECTED').all()
    order2 = Order.query.filter(Order.end_date >= e_date, Order.begin_date <= e_date, Order.status != 'REJECTED').all()

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
    #  =======================================================================
    if int(h_id) in houses_id:
        order = Order()

        order.begin_date = s_date
        order.end_date = e_date
        order.house_id = h_id
        order.days = days

        house = House.query.get(order.house_id)
        house.order_count += 1
        order.house_price = house.price
        order.amount = request.form.get('amount')
        order.user_id = session['user_id']
        order.add_update()
        house.add_update()
        return jsonify({'code':200,'msg':'请求成功!'})

    already_order = Order.query.filter(Order.house_id==h_id,Order.status != 'REJECTED').first()
    data = already_order.to_dict()
    return jsonify({'code':1001,'msg':'该时间段已被预订','data':data})

@order_blue.route('/orders_comment/',methods=['PATCH'])
@login_required
def add_orders_comment():
    order_id = request.form.get('order_id')
    comment = request.form.get('comment')
    if comment:
        order = Order.query.get(order_id)
        order.comment = comment
        order.add_update()
        return jsonify({'code':200,'msg':'请求成功'})
    return jsonify({'code':1001,'msg':'评价不能为空'})


@order_blue.route('/lorders/',methods=['GET'])
@login_required
def lorders():
    """
    客户订单
    :return:
    """

    return render_template('lorders.html')

@order_blue.route('/lorders_info/',methods=['GET'])
@login_required
def lorders_info():
    """
    客户订单内容返还
    :return:
    """
    houses = House.query.filter_by(user_id=session['user_id']).all()
    if houses:
        status = {
            'WAIT_ACCEPT': '待接单',
            'WAIT_PAYMENT': '待支付',
            'PAID': '已支付',
            'WAIT_COMMENT': '待评价',
            'COMPLETE': '已完成',
            'CANCELED': '已取消',
            'REJECTED': '已拒单'
        }
        c_list = []
        for house in houses:
            orders = Order.query.filter_by(house_id = house.id).all()
            for order in orders:
                c_list.append(order.to_dict())
        return jsonify({'code':200,'msg':'请求成功','c_list':c_list,'status':status})
    return jsonify({'code':1001,'msg':'您还没有房源'})


@order_blue.route('/lorders_info/',methods=['PATCH'])
@login_required
def lorders_add():

    kind = request.form.get('code')
    order_id = request.form.get('order_id')
    if kind == 'accept':
        order = Order.query.get(order_id)
        order.status = "COMPLETE"
        order.add_update()
    if kind == 'reject':
        order = Order.query.get(order_id)
        order.status = "REJECTED"
        order.add_update()
    return jsonify({'code':200,'msg':'请求成功!','data':order.status})


@order_blue.route('/booking/',methods=['GET'])
@login_required
def booking():
    """
    预定页面
    :return:
    """
    return render_template('booking.html')

@order_blue.route('/booking_info/<int:id>/',methods=['GET'])
@login_required
def booking_info(id):
    """
    预定页面内容请求
    :param id:
    :return:
    """
    house = House.query.get(id)
    h_list = house.to_dict()
    return jsonify({'code':200,'msg':'请求成功','h_list':h_list})