
from flask import session, url_for,redirect
from functools import wraps

def login_required(func):
    @wraps(func)
    def check(*args,**kwargs):
        if 'user_id' in session:
            return func(*args,**kwargs)
        else:
            return redirect(url_for('user.login'))
    return check