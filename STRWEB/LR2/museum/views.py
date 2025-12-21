from datetime import timezone, datetime, timedelta
import pytz
import museum.apis as api
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse_lazy
from django.views import View
from django.contrib.auth.hashers import make_password
from .forms import *
import museum.models as mod
from museum import functions, apis,  models
import tzlocal
import calendar
import logging
from django.utils import timezone
from django.contrib.auth.decorators import user_passes_test
from .forms import ExhibitForm
from django.db.models import Q
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Company, CompanyHistory, CompanyRequisite, CompanyCertificate,Employee, EmployeePosition, CustomUser, Hall,SliderSettings, Exhibitions, Cart, CartItem, Order, Client
import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.contrib import messages

def main_info(request):
    cat_fact = apis.get_cat_fact()
    latest_news = mod.News.objects.order_by('-date').first()
    exhibitions = mod.Exhibitions.objects.all()[:6]  
    partners = mod.PartnerCompany.objects.all() 
    
    try:
        slider_settings_obj = SliderSettings.objects.get(name='default')
        slider_settings = {
            'auto': slider_settings_obj.auto,
            'delay': slider_settings_obj.delay,
            'loop': slider_settings_obj.loop,
            'navs': slider_settings_obj.navs,
            'pags': slider_settings_obj.pags,
            'stop_mouse_hover': slider_settings_obj.stop_mouse_hover,
        }
    except SliderSettings.DoesNotExist:
       
        slider_settings = {
            'auto': True,
            'delay': 5,
            'loop': True,
            'navs': True,
            'pags': True,
            'stop_mouse_hover': True,
        }
    
    context = {
        "latest_news": latest_news,
        "cat_fact": cat_fact,
        "exhibitions": exhibitions,
        "partners": partners,
        'slider_settings': slider_settings,
    }
   
    return render(request, 'main_info.html', context)

def set_slider_settings(request):
    if request.method == 'POST' and request.user.is_superuser:
        try:
           
            settings_obj, created = SliderSettings.objects.get_or_create(
                name='default',
                defaults={
                    'auto': True,
                    'delay': 5,
                    'loop': True,
                    'navs': True,
                    'pags': True,
                    'stop_mouse_hover': True
                }
            )
           
            auto = 'auto' in request.POST
            delay = int(request.POST.get('delay', 5))
            
            if delay == 0:
                delay = 5
            
            stop_mouse_hover = 'stop_mouse_hover' in request.POST and auto
            
            settings_obj.auto = auto
            settings_obj.delay = delay
            settings_obj.loop = 'loop' in request.POST
            settings_obj.navs = 'navs' in request.POST
            settings_obj.pags = 'pags' in request.POST
            settings_obj.stop_mouse_hover = stop_mouse_hover
            
            settings_obj.save()
            
            messages.success(request, 'Настройки слайдера сохранены для всех пользователей')
            print("Настройки сохранены в БД:", {
                'auto': settings_obj.auto,
                'delay': settings_obj.delay,
                'loop': settings_obj.loop,
                'navs': settings_obj.navs,
                'pags': settings_obj.pags,
                'stop_mouse_hover': settings_obj.stop_mouse_hover
            })
        except Exception as e:
            messages.error(request, f'Ошибка сохранения настроек: {str(e)}')
    
    referer = request.META.get('HTTP_REFERER', '/')
    return redirect(referer)


def toys_view(request):
    return render(request, 'toys.html')


def contacts_api(request):
    if request.method == 'GET':
        employees = Employee.objects.select_related('user', 'job').all().order_by('id')
        data = []
        for e in employees:
            full_name = f"{e.user.first_name} {e.user.last_name}".strip()
            data.append({
                "id": e.id,
                "fullName": full_name or e.user.username,
                "job": e.job.name if e.job else "",
                "description": f"Работает в зале {e.hall.name}" if getattr(e, 'hall', None) else "",
                "phone": e.user.telephone or "",
                "email": e.user.email or "",
                "photoUrl": (e.image_source.url if e.image_source else ""),
            })
        return JsonResponse(data, safe=False)

    if request.method == 'POST':
        try:
            payload = json.loads(request.body.decode('utf-8'))
        except Exception:
            return HttpResponseBadRequest('Invalid JSON')
        full_name = (payload.get('fullName') or '').strip()
        desc = (payload.get('description') or '').strip()
        phone = (payload.get('phone') or '').strip()
        email = (payload.get('email') or '').strip()
        photo_url = (payload.get('photoUrl') or '').strip()
        job_name = (payload.get('job') or '').strip()

        # Разбор ФИО: Иванов Иван Иванович -> last_name, first_name
        parts = full_name.split()
        last_name = parts[0] if parts else ''
        first_name = parts[1] if len(parts) > 1 else ''
        
        with transaction.atomic():
            user = CustomUser.objects.create(
                username=f"user_{CustomUser.objects.count()+1}",
                first_name=first_name,
                last_name=last_name,
                email=email,
                telephone=phone
            )
            job = None
            if job_name:
                job, _ = EmployeePosition.objects.get_or_create(name=job_name, defaults={'salary': 0})
            emp = Employee.objects.create(
                user=user,
                job=job,
                hall = Hall.objects.first(),  # или Hall.objects.get(name="Главный")

            )
        return JsonResponse({"ok": True, "id": emp.id})

    return HttpResponseBadRequest('Unsupported method')



def exhibition_detail(request, exhibition_id):
    exhibition = get_object_or_404(Exhibitions, id=exhibition_id)
    return render(request, 'exhibition_detail.html', {'exhibition': exhibition})

@login_required
def add_to_cart(request, exhibition_id):
    exhibition = get_object_or_404(Exhibitions, id=exhibition_id)
    client = get_object_or_404(Client, user=request.user)
   
    cart, created = Cart.objects.get_or_create(client=client, is_ordered=False)
    
    cart_item, created = CartItem.objects.get_or_create(
        cart=cart, 
        exhibition=exhibition,
        defaults={'quantity': 1}
    )
    
    if not created:
        cart_item.quantity += 1
        cart_item.save()
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return JsonResponse({
            'success': True, 
            'cart_items_count': cart.items.count(),
            'message': 'Товар добавлен в корзину'
        })
    
    return redirect('cart')

@login_required
def cart_view(request):
    client = get_object_or_404(Client, user=request.user)
    cart, created = Cart.objects.get_or_create(client=client, is_ordered=False)
    
    return render(request, 'cart.html', {'cart': cart})

@login_required
def update_cart_item(request, item_id):
    cart_item = get_object_or_404(CartItem, id=item_id, cart__client__user=request.user)
    
    if request.method == 'POST':
        action = request.POST.get('action')
        
        if action == 'increase':
            cart_item.quantity += 1
        elif action == 'decrease' and cart_item.quantity > 1:
            cart_item.quantity -= 1
        elif action == 'remove':
            cart_item.delete()
            return redirect('cart')
            
        cart_item.save()
    
    return redirect('cart')


@login_required
def checkout(request):
    client = get_object_or_404(Client, user=request.user)
    
    try:
        cart = Cart.objects.get(client=client, is_ordered=False)
    except Cart.DoesNotExist:
        return render(request, 'order_success.html', {
            'error': 'У вас нет активной корзины. Добавьте товары в корзину сначала.'
        })
    
    if request.method == 'POST':
        form = PaymentForm(request.POST)
        
        if form.is_valid():
            order = Order.objects.create(
                client=client,
                cart=cart,
                is_paid=True
            )
            
            cart.is_ordered = True
            cart.save()
            
            return render(request, 'order_success.html', {'order': order})
        else:
            
            return render(request, 'checkout.html', {
                'cart': cart,
                'form': form,
                'errors': form.errors
            })
   
    form = PaymentForm()
    return render(request, 'checkout.html', {
        'cart': cart,
        'form': form
    })

logger = logging.getLogger('django')

@user_passes_test(lambda u: u.is_superuser)
def add_exhibit(request):
    if request.method == 'POST':
        form = ExhibitForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('exhibitions')
    else:
        form = ExhibitForm()
    return render(request, 'museum/add_edit_entity.html', {'form': form})



class LoginView(View):
    template_name = 'login.html'
    form_class = LoginForm
    success_url = reverse_lazy('home')

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        form = self.form_class(request.POST)
        if form.is_valid():
            data = form.cleaned_data
            user = authenticate(request, username=data['username'], password=data['password'])
            if user:
                login(request, user)
                logger.info(f'User logged in')
                return redirect(self.success_url)

        logger.info(f'User didn\'t log in')
        return render(request, self.template_name, {'form': form})


class ClientRegistrationView(View):
    template_name = 'register.html'
    form_class = ClientRegistrationForm
    success_url = reverse_lazy('login')

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        client = self.form_class(request.POST)
        if client.is_valid():
            data = client.cleaned_data
            date_of_birth = data['date_of_birth']
            today = date.today()
            age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
            if int(age) < 18:
                return render(request, self.template_name, {'form': client, 'error': 'You must be at least 18 years old to register.'})

            user = models.CustomUser(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                password=make_password(data['password1']),
                telephone=data['telephone'],
                username=data['email'],
                date_of_birth=data['date_of_birth'],
            )
            user.save()

            client_object = client.save(commit=False)
            client_object.user = user
            client_object.save()

            logger.info(f'Client was added')
            return redirect('login')

        logger.info(f'Client was NOT added')
        return render(request, self.template_name, {'form': client})


class EmployeeRegistrationView(View):
    template_name = 'register.html'
    form_class = EmployeeRegistrationForm
    success_url = reverse_lazy('employee_positions')

    def get(self, request):
        form = self.form_class()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        employee = self.form_class(request.POST, request.FILES)
        if employee.is_valid():
            data = employee.cleaned_data
            date_of_birth = data['date_of_birth']
            today = date.today()
            age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
            if int(age) < 18:
                return render(request, self.template_name, {'form': employee, 'error': 'You must be at least 18 years old to register.'})

            user = models.CustomUser(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                password=make_password(data['password1']),
                telephone=data['telephone'],
                username=data['email'],
                date_of_birth=data['date_of_birth'],
                is_staff=True,
            )
            user.save()
            employee_object = employee.save(commit=False)
            employee_object.user = user
            employee_object.image_source = data['image_source']
            employee_object.date_of_beginning = datetime.now().strftime("%m-%d-%Y %H:%M:%S %Z")
            employee_object.save()
            employee_object.exhibits.set(data['exhibits'])
            employee_object.save()

            logger.info(f'Employee was added')
            return redirect('employees')

        logger.info(f'Employee was NOT added')
        return render(request, self.template_name, {'form': employee})


def delete_user(request, pk):
    user = models.CustomUser.objects.get(pk=pk)

    user.delete()

    logger.info(f'User was deleted')

    return redirect('home')


def edit_employee(request, pk):
    custom_user = models.CustomUser.objects.get(pk=pk)
    employee = models.Employee.objects.get(user=custom_user)
    form = EmployeeRegistrationForm({
        'first_name': custom_user.first_name,
        'last_name': custom_user.last_name,
        'email': custom_user.email,
        'telephone': custom_user.telephone,
        'age': custom_user.age,
        'image_source': employee.image_source,
        'exhibits': employee.exhibits.all(),
        'job': employee.job,
    })

    if request.method == 'POST':
        form = EmployeeRegistrationForm(request.POST, request.FILES)
        if form.is_valid():
            data = form.cleaned_data
            custom_user.first_name = data['first_name']
            custom_user.last_name = data['last_name']
            custom_user.email = data['email']
            custom_user.password = make_password(data['password1'])
            custom_user.telephone = data['telephone']
            custom_user.username = data['email']
            custom_user.age = data['age']

            custom_user.save()

            employee.image_source = data['image_source']
            employee.position = data['position']
            employee.clients.set(data['clients'])
            employee.save()

            logger.info(f'Employee was edited')

            return redirect('employees')

    return render(request, 'register.html', {'form': form})


class EmployeesView(View):
    template_name = "employees.html"

    def get(self, request):
        employee = models.Employee.objects.all()
        all_halls = models.Hall.objects.all()
        hall_filter = request.GET.get('hall_filter')
        if hall_filter:
            employee = employee.filter(hall_id=hall_filter)
        context = {'employees': employee, 'all_halls': all_halls, }
        return render(request, self.template_name, context)


class ClientsView(View):
    template_name = "clients.html"

    def get(self, request):
        context = {'clients': models.Client.objects.all()}
        return render(request, self.template_name, context)


class LogoutView(View):
    success_url = reverse_lazy('login')

    def get(self, request):
        logout(request)

        logger.info(f'User logged out')

        return redirect(self.success_url)


def about_company(request): 
    logger.info('About company view was accessed')

    try:
        company = Company.objects.first()
        histories = CompanyHistory.objects.filter(company=company).order_by('-year')
        requisites = CompanyRequisite.objects.filter(company=company)
        certificates = CompanyCertificate.objects.filter(company=company)
    except Company.DoesNotExist:
        company = None
        histories = []
        requisites = []
        certificates = []

    context = {
        'company': company,
        'histories': histories,
        'requisites': requisites,
        'certificates': certificates,
        'client_age_median': functions.client_age_median(),
        'client_age_mean': functions.client_age_mean(),
        'client_age_mode': functions.client_age_mode(),
        'get_order_with_highest_price': functions.get_order_with_highest_price(),
        'get_most_popular_exhibition': functions.get_most_popular_exhibition(),
        'histogram_url': functions.plot_halls(),
    }

    return render(request, 'about_company.html', context)

def news_page(request):
    logger.info('News view was accessed')

    news = mod.News.objects.order_by('-date')

    context = {"news": news}

    return render(request, "news.html", context)


def dictionary_page(request):
    logger.info('Dictionary view was accessed')

    questions = mod.Question.objects.all().order_by('-date')

    context = {"questions": questions}

    return render(request, "dictionary.html", context)


def contacts_page(request):
    logger.info('Contacts view was accessed')

    employees = models.Employee.objects.all()

    context = {"employees": employees}

    return render(request, "contacts.html", context)


def privacy_policy_page(request):
    logger.info('Privacy policy view was accessed')
    weather_data = api.get_weather()  
    print("Weather Data:", weather_data)  
    context = {
        "weather_data": weather_data
    }
    return render(request, "policy.html", context)

def vacancies_page(request):
    logger.info('Vacancies view was accessed')

    vacancies = mod.Vacancy.objects.all()

    context = {"vacancies": vacancies}

    return render(request, "vacancies.html", context)


def discounts_page(request):
    logger.info('Discounts view was accessed')

    promo_codes = mod.PromoCode.objects.all()
    bonuses = mod.Bonus.objects.all()
    context = {"promo_codes": promo_codes, "bonuses": bonuses}

    return render(request, "discounts.html", context)


class ReviewsView(View):
    template_name = "rewies.html"
    form_class = ReviewForm

    def get(self, request):
        context = {'reviews': mod.Review.objects.all().order_by('-date')}

        if request.user.is_authenticated:
            context['form'] = self.form_class

        return render(request, self.template_name, context)

    def post(self, request):
        if not request.user.is_authenticated:
            return redirect('login')
        form = self.form_class(request.POST)
        print(form.data, form.is_valid())
        if form.is_valid():
            review = form.save(commit=False)
            review.author = models.Client.objects.get(user=request.user)
            review.date = datetime.now()
            review.save()

            logger.info(f'Review was added')

        context = {'reviews': mod.Review.objects.all().order_by('-date'), 'form': self.form_class}
        return render(request, self.template_name, context)


class AddQuestionView(View):
    template_name = "add_something.html"
    success_url = reverse_lazy('dictionary')
    form_class = QuestionForm

    def get(self, request):
        context = {'form': self.form_class}
        return render(request, self.template_name, context)

    def post(self, request):
        form = self.form_class(request.POST)

        if form.is_valid():
            question = form.save(commit=False)
            question.date = datetime.now()
            question.save()

            logger.info(f'Question was added {question.pk}')

            return redirect(self.success_url)

        logger.info(f'Question was NOT added')

        return render(request, self.template_name, {'form': form})


class AddAnswerView(View):
    template_name = "add_something.html"
    success_url = reverse_lazy('dictionary')
    form_class = AnswerForm

    def get(self, request, pk):
        context = {'form': self.form_class}
        return render(request, self.template_name, context)

    def post(self, request, pk):
        form = self.form_class(request.POST)

        if form.is_valid():
            answer = form.save(commit=False)
            answer.date = datetime.now()
            answer.save()
            question = mod.Question.objects.get(pk=pk)
            question.answer = answer
            question.save()

            logger.info(f'Answer was added to question {question.pk}')

            return redirect(self.success_url)

        logger.info(f'Answer was NOT added to question')

        return render(request, self.template_name, {'form': form})


def update_vacancy(request, pk):
    logger.info('Update vacancy view was accessed')

    vacancy = mod.Vacancy.objects.get(pk=pk)

    if request.method == "GET":
        form = VacancyForm(initial={
            'employee_position': vacancy.employee_position,
            'number_of_this_position': vacancy.number_of_this_position,
            'vacancy_description': vacancy.vacancy_description,
        })

        context = {'form': form}
        return render(request, "add_something.html", context)

    else:
        form = VacancyForm(request.POST)

        if form.is_valid():
            vacancy.employee_position = form.cleaned_data['employee_position']
            vacancy.number_of_this_position = form.cleaned_data['number_of_this_position']
            vacancy.vacancy_description = form.cleaned_data['vacancy_description']
            vacancy.save()

            logger.info(f'Vacancy where pk={pk} was updated')

            return redirect('vacancies')

        logger.info('Vacancy where pk={pk} was NOT updated')

        return render(request, "add_something.html", {'form': form})


class AddEmployeePositionView(View):
    template_name = "add_something.html"
    form_class = EmployeePositionForm
    success_url = reverse_lazy('employee_positions')

    def get(self, request):
        context = {'form': self.form_class}
        return render(request, self.template_name, context)

    def post(self, request):
        form = self.form_class(request.POST)

        if form.is_valid():
            form.save()

            logger.info(f'Employee position was added')

            return redirect(self.success_url)

        logger.info(f'Employee position was NOT added')

        return render(request, self.template_name, {'form': form})


def delete_vacancy(request, pk):
    vacancy = mod.Vacancy.objects.get(pk=pk)
    vacancy.delete()

    logger.info(f'Vacancy was deleted')
    return redirect('vacancies')


class AddVacancyView(View):
    template_name = "add_something.html"
    form_class = VacancyForm
    success_url = reverse_lazy('vacancies')

    def get(self, request):
        context = {'form': self.form_class}
        return render(request, self.template_name, context)

    def post(self, request):
        form = self.form_class(request.POST)

        if form.is_valid():
            form.save()

            logger.info(f'Vacancy was added')

            return redirect(self.success_url)

        logger.info(f'Vacancy was not added')

        return render(request, self.template_name, {'form': form})


def update_employee_position(request, pk):
    employee_position = models.EmployeePosition.objects.get(pk=pk)

    if request.method == "GET":
        form = EmployeePositionForm(initial={
            'name': employee_position.name,
            'area': employee_position.salary,
        })

        context = {'form': form}
        return render(request, "add_something.html", context)

    else:
        form = EmployeePositionForm(request.POST)

        if form.is_valid():
            employee_position.name = form.cleaned_data['name']
            employee_position.salary = form.cleaned_data['salary']
            employee_position.save()

            logger.info(f'Employee position was updated')

            return redirect('employee_positions')

        logger.info(f'Employee position was NOT updated')

        return render(request, "add_something.html", {'form': form})


def delete_employee_position(request, pk):
    employee_position = models.EmployeePosition.objects.get(pk=pk)
    employee_position.delete()

    logger.info(f'Employee position was deleted')

    return redirect('employee_positions')


class EmployeePositionsView(View):
    template_name = "employee_positions.html"

    def get(self, request):
        logger.info(f'Employee positions view was accessed')

        context = {'employee_positions': models.EmployeePosition.objects.all()}
        return render(request, self.template_name, context)


def museum(request):
    halls = models.Hall.objects.all()
    exhibits = models.Exhibit.objects.all()
    exhibitions = models.Exhibitions.objects.all()
    employees = models.Employee.objects.all()
    today_date = datetime.now(pytz.timezone('UTC'))
    main_date = today_date - timedelta(days=180)

    show_recent_exhibits = request.GET.get('show_recent_exhibits', False)

    content = {"halls": halls, "exhibits": exhibits, "exhibitions": exhibitions, "employees": employees,
               'today_date': today_date, 'show_recent_exhibits': show_recent_exhibits, 'main_date': main_date}
    return render(request, "museum.html", content)


def exhibitions(request):
    halls = models.Hall.objects.all()
    exhibits = models.Exhibit.objects.all()
    exhibition = models.Exhibitions.objects.all()
    employees = models.Employee.objects.all()
    content = {"halls": halls, "exhibits": exhibits, "exhibitions": exhibition, "employees": employees}
    return render(request, "exhibitions.html", content)


class ProfileClientView(View):
    template_name = 'profile.html'
    context = 0

    def get(self, request):
        current_user = models.Client.objects.get(user=request.user)
        orders = mod.Order.objects.filter(client=current_user)

        tz = tzlocal.get_localzone()
        local_time = datetime.now(tz)
        now_time = datetime.now(tz)
        utc_time = datetime.now(tz=pytz.timezone('UTC'))

        text_cal = calendar.month(local_time.year, local_time.month)

        self.context = {
            'current_user': current_user,
            'orders': orders,
            'user_timezone': tz,
            'current_date_formatted': now_time.strftime("%m-%d-%Y %H:%M:%S %Z"),
            'calendar_text': text_cal,
            'utc_time': utc_time.strftime("%m-%d-%Y %H:%M:%S %Z"),
        }

        return render(request, self.template_name, self.context)


class ProfileEmployeeView(View):
    template_name = 'profile.html'

    def get(self, request):
        current_user = models.Employee.objects.get(user=request.user)
        exhibits = current_user.exhibits.all()
        exhibitionss = current_user.exhibitions.all()
        tz = tzlocal.get_localzone()
        local_time = datetime.now(tz)
        now_time = datetime.now(tz)
        utc_time = timezone.now().strftime('%d-%m-%Y %H:%M:%S')
        text_cal = calendar.month(local_time.year, local_time.month)

        context = {
            'current_user': current_user,
            'user_timezone': tz,
            'current_date_formatted': now_time.strftime("%d-%m-%Y %H:%M:%S %Z"),
            'calendar_text': text_cal,
            'utc_time': utc_time,
            'exhibit_for_employee': exhibits,
            'exhibition_for_employee': exhibitionss,
        }
        # for order in orders_by_client:
        #     print(order.client)

        return render(request, self.template_name, context)


class AddOrderView(View):
    template_name = "add_something.html"
    form_class = OrderForm
    success_url = reverse_lazy('client_profile')

    def get(self, request):
        context = {'form': self.form_class}
        return render(request, self.template_name, context)

    def post(self, request):
        form = self.form_class(request.POST)
        print(form.data)
        if form.is_valid():
            order = form.save(commit=False)
            order.client = models.Client.objects.get(user=request.user)
            # order.date_time = datetime.now(timezone.utc)
            order.save()

            logger.info(f'Order was added')

            return redirect(self.success_url)

        context = {'form': self.form_class}

        logger.info(f'Order was NOT added')

        return render(request, self.template_name, context)


class OrderDetailView(View):
    template_name = "order_details.html"

    def get(self, request, pk):
        order = mod.Order.objects.get(pk=pk)
        exhibition = models.Exhibitions.objects.filter(order=order)
        context = {'order': order,
                   'exhibitions': exhibition}

        return render(request, self.template_name, context)


class AddExhibitionsView(View):
    template_name = "add_something.html"
    form_class = ExhibitionsForm
    success_url = reverse_lazy('client_profile')

    def get(self, request, pk):
        context = {'form': self.form_class}
        return render(request, self.template_name, context)

    def post(self, request, pk):
        form = self.form_class(request.POST)

        if form.is_valid():
            exhibition = models.Exhibitions(
                service_type=form.cleaned_data['service_type'],
                number=form.cleaned_data['number'],
            )
            exhibition.save()
            order = models.Order.objects.filter(pk=pk)[0]
            order.exhibitions.add(exhibition)

            order.save()

            logger.info(f'Service was added')

            # order.total_price = order.get_total_price()
            # order.save()
            return redirect(self.success_url)

        logger.info(f'Service was NOT added')

        return render(request, self.template_name, {'form': form})


class AddExhibitionsTypeView(View):
    template_name = "add_something.html"
    form_class = ExhibitionsTypeForm
    success_url = reverse_lazy('exhibitions')

    def get(self, request):
        context = {'form': self.form_class}
        return render(request, self.template_name, context)

    def post(self, request):
        form = self.form_class(request.POST)
        print(form.data)

        if form.is_valid():
            form.save()

            logger.info(f'Service type was added')

            return redirect(self.success_url)

        logger.info(f'Service type was NOT added')

        return render(request, self.template_name, {'form': form})

def exhibitions(request):
    exhibitions = Exhibitions.objects.all()
    
    # Поиск
    search_query = request.GET.get('search', '')
    if search_query:
        exhibitions = exhibitions.filter(
            Q(name__icontains=search_query) |
            Q(hall__name__icontains=search_query) |
            Q(people__icontains=search_query) |
            Q(cost__icontains=search_query)
        )
    
    # Сортировка
    sort_by = request.GET.get('sort', '-date')  # По умолчанию сортируем по дате (новые сначала)
    if sort_by in ['name', 'date', 'cost', 'people']:
        exhibitions = exhibitions.order_by(sort_by)
    elif sort_by in ['-name', '-date', '-cost', '-people']:
        exhibitions = exhibitions.order_by(sort_by)
    
    context = {
        'exhibitions': exhibitions,
    }
    return render(request, 'exhibitions.html', context)

class ExhibitionsView(View):
    template_name = "exhibitions.html"

    def get(self, request):
        exhibitions = models.Exhibitions.objects.all()
        
       
        search_query = request.GET.get('search', '')
        if search_query:
            exhibitions = exhibitions.filter(
                Q(name__icontains=search_query) |
                Q(hall__name__icontains=search_query)
            )
        
        
        sort_by = request.GET.get('sort', 'date')
        if sort_by in ['name', 'date', 'cost', 'people']:
            exhibitions = exhibitions.order_by(sort_by)
        
        context = {
            "exhibitions": exhibitions,
            "search_query": search_query,
            "sort_by": sort_by,
        }
        return render(request, self.template_name, context)