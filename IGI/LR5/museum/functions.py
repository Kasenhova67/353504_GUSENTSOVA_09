from datetime import datetime
from statistics import median, mean, mode
from django.db.models import Q, Avg, Max, Count, Sum, Prefetch, ExpressionWrapper, DecimalField, F
from django.db.models import FloatField
import matplotlib.pyplot as plt
import io
import base64
from urllib import parse
from collections import Counter

from matplotlib.colors import CSS4_COLORS

from museum.models import Order
from museum.models import Client, Exhibitions


def client_age_median():
    clients = Client.objects.filter(~Q(user__date_of_birth=None))
    ages = [(datetime.now().date() - client.user.date_of_birth).days // 365 for client in clients]
    if ages:
        return median(ages)
    else:
        return None


def client_age_mode():
    clients = Client.objects.filter(~Q(user__date_of_birth=None))
    ages = [(datetime.now().date() - client.user.date_of_birth).days // 365 for client in clients]
    if ages:
        return mean(ages)
    else:
        return None


def client_age_mean():
    clients = Client.objects.filter(~Q(user__date_of_birth=None))
    ages = [(datetime.now().date() - client.user.date_of_birth).days // 365 for client in clients]
    if ages:
        return mean(ages)
    else:
        return None


def get_order_with_highest_price():
    orders = Order.objects.all()

    if not orders:
        return None

    highest_price_order = max(orders, key=lambda x: x.get_total_price())
    return highest_price_order.get_total_price()


def get_most_popular_exhibition():
    orders = Order.objects.all()
    exhibition_counts = Counter(order.exhibitions.name for order in orders)
    most_common_word = exhibition_counts.most_common(1)[0][0]
    return most_common_word


def plot_halls():
    exhibition_counts = Exhibitions.objects.values('hall__name').annotate(
        total_visitors=Sum('people'),
        total_revenue=Sum('cost')
    )

    hall_names = [ec['hall__name'] for ec in exhibition_counts]
    visitor_counts = [ec['total_visitors'] for ec in exhibition_counts]
    revenue_counts = [ec['total_revenue'] for ec in exhibition_counts]

   
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
    
    bars = ax1.bar(hall_names, visitor_counts, color='lightblue')
    ax1.set_title('Visitors per Hall')
    ax1.set_xlabel('Hall Name')
    ax1.set_ylabel('Number of Visitors')
    ax1.tick_params(axis='x', rotation=45)
    
    for bar in bars:
        height = bar.get_height()
        ax1.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(height)}',
                ha='center', va='bottom')

    ax2.pie(revenue_counts, labels=hall_names, autopct='%1.1f%%', startangle=90)
    ax2.set_title('Revenue Distribution by Hall')
    ax2.axis('equal')  

    plt.tight_layout()

    buf = io.BytesIO()
    plt.savefig(buf, format='png', dpi=100)
    buf.seek(0)
    string = base64.b64encode(buf.read())
    url = parse.quote(string)
    plt.close()

    return url