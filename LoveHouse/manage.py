from flask import Flask, redirect, url_for
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager

from app.house_view import house_blue
from app.order_views import order_blue
from app.user_views import user_blue, login_manager
from app.models import db

app = Flask(__name__)

app.secret_key = '1585926sad6a4sda4s5d1a3sda'
"""
注册蓝图对象
"""
app.register_blueprint(blueprint=order_blue,url_prefix='/order')
app.register_blueprint(blueprint=house_blue,url_prefix='/house')
app.register_blueprint(blueprint=user_blue,url_prefix='/user')

"""
    配置数据库
    dialect+drive://username:password@host:port/database
"""
# 启动首页地址
@app.route('/')
def house_index():
	return redirect(url_for('house.index'))

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:123456@127.0.0.1:3306/lovehouse'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

"""
生成迁移对象
"""
migrate = Migrate(app,db)

"""
初始化flask-login
"""
login_manager.init_app(app)
# 管理flask对象
manager = Manager(app)

manager.add_command('db',MigrateCommand)

if __name__ == '__main__':
    manager.run()
