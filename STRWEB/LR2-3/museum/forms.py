from datetime import date

from django import forms
from django.forms import DateTimeInput

from .models import Review, Question, Answer, Vacancy, Order
from museum.models import CustomUser, Client, Employee, EmployeePosition, Exhibitions,Exhibit
from .mixins import ValidationMixin

from django import forms
import re
from datetime import datetime

class PaymentForm(forms.Form):
    card_number = forms.CharField(
        max_length=19,
        label='Номер карты',
        widget=forms.TextInput(attrs={
            'placeholder': 'XXXX XXXX XXXX XXXX',
            'class': 'form-control',
            'id': 'card-number'
        })
    )
    
    expiry_date = forms.CharField(
        max_length=5,
        label='Срок действия (ММ/ГГ)',
        widget=forms.TextInput(attrs={
            'placeholder': 'MM/YY',
            'class': 'form-control',
            'id': 'expiry-date'
        })
    )
    
    cvv = forms.CharField(
        max_length=3,
        label='CVV',
        widget=forms.TextInput(attrs={
            'placeholder': 'XXX',
            'class': 'form-control',
            'id': 'cvv'
        })
    )
    
    card_holder = forms.CharField(
        max_length=100,
        label='Имя владельца карты',
        widget=forms.TextInput(attrs={
            'placeholder': 'IVAN IVANOV',
            'class': 'form-control',
            'id': 'card-holder'
        })
    )

    def clean_card_number(self):
        card_number = self.cleaned_data['card_number']
        
        clean_number = card_number.replace(' ', '')
        
        if not clean_number.isdigit():
            raise forms.ValidationError('Номер карты должен содержать только цифры и пробелы')
        
        if len(clean_number) != 16:
            raise forms.ValidationError('Номер карты должен содержать 16 цифр')
        
        formatted = ' '.join([clean_number[i:i+4] for i in range(0, 16, 4)])
        return formatted

    def clean_expiry_date(self):
        expiry_date = self.cleaned_data['expiry_date']
        
        if not re.match(r'^\d{2}/\d{2}$', expiry_date):
            raise forms.ValidationError('Введите дату в формате ММ/ГГ')
        
        month, year = expiry_date.split('/')
        
        if not (1 <= int(month) <= 12):
            raise forms.ValidationError('Месяц должен быть от 01 до 12')
        
        current_year = datetime.now().year % 100  # Последние 2 цифры года
        current_month = datetime.now().month
        
        if int(year) < current_year or (int(year) == current_year and int(month) < current_month):
            raise forms.ValidationError('Срок действия карты истек')
        
        return expiry_date

    def clean_cvv(self):
        cvv = self.cleaned_data['cvv']
       
        if not cvv.isdigit() or len(cvv) != 3:
            raise forms.ValidationError('CVV должен содержать 3 цифры')
        
        return cvv

    def clean_card_holder(self):
        card_holder = self.cleaned_data['card_holder']
        
        if not re.match(r'^[A-Za-zА-Яа-я\s]+$', card_holder):
            raise forms.ValidationError('Имя должно содержать только буквы и пробелы')
        
        return card_holder.upper() 

class UserRegistrationForm(forms.ModelForm):
    date_of_birth = forms.DateField(label='Date of Birth', widget=forms.DateInput(attrs={'type': 'date'}))

    class Meta:
        model = CustomUser
        fields = ('email', 'first_name', 'last_name', 'telephone', 'date_of_birth')


class ClientRegistrationForm(forms.ModelForm, ValidationMixin):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput())
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput())

    class Meta:
        model = Client
        exclude = ('user',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.update(UserRegistrationForm().fields)
        self.order_fields(['email', 'first_name', 'last_name', 'date_of_birth', 'telephone', 'password1', 'password2'])

    def clean(self):
        cleaned_data = super().clean()
        self.check_email(cleaned_data.get('email'))
        self.check_passwords(cleaned_data.get('password1'), cleaned_data.get('password2'))
        self.check_password_length(cleaned_data.get('password1'))
        self.check_date_of_birth(cleaned_data.get('date_of_birth'))
        self.check_telephone(cleaned_data.get('telephone'))

    def check_date_of_birth(self, date_of_birth):
        if date_of_birth:
            today = date.today()
            age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
            if int(age) < 18:
                self.add_error('date_of_birth', 'You must be at least 18 years old to register.')


class EmployeeRegistrationForm(forms.ModelForm, ValidationMixin):
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput())
    password2 = forms.CharField(label='Confirm Password', widget=forms.PasswordInput())

    class Meta:
        model = Employee
        exclude = ('user',)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.update(UserRegistrationForm().fields)
        self.order_fields(['email', 'first_name', 'last_name', 'date_of_birth', 'telephone', 'password1', 'password2'])

    def clean(self):
        cleaned_data = super().clean()
        self.check_email(cleaned_data.get('email'))
        self.check_passwords(cleaned_data.get('password1'), cleaned_data.get('password2'))
        self.check_password_length(cleaned_data.get('password1'))
        self.check_date_of_birth(cleaned_data.get('date_of_birth'))
        self.check_telephone(cleaned_data.get('telephone'))

    def check_date_of_birth(self, date_of_birth):
        if date_of_birth:
            today = date.today()
            age = today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
            if int(age) < 18:
                self.add_error('date_of_birth', 'You must be at least 18 years old to register.')


class LoginForm(forms.Form):
    class Meta:
        model = CustomUser
        fields = ('username', 'password')

    username = forms.CharField(max_length=255)
    password = forms.CharField(max_length=255, widget=forms.PasswordInput)

    def __init__(self, *args, **kwargs):
        super(LoginForm, self).__init__(*args, **kwargs)


class EmployeePositionForm(forms.ModelForm):
    class Meta:
        model = EmployeePosition
        exclude = []


class VacancyForm(forms.ModelForm):
    class Meta:
        model = Vacancy
        exclude = []


class QuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        exclude = ['date', 'answer']


class AnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        exclude = ['date']


class ReviewForm(forms.ModelForm):
    class Meta:
        model = Review
        exclude = ['author', 'date']


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        exclude = ['client']


class ExhibitionsForm(forms.ModelForm):
    class Meta:
        model = Exhibitions
        exclude = ['']

class ExhibitForm(forms.ModelForm):
    class Meta:
        model = Exhibit
        fields = '__all__' 
        
        widgets = {
            'date': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

class ExhibitionsTypeForm(forms.ModelForm):
    class Meta:
        model = Exhibitions
        exclude = ['']

        widgets = {
            'date': DateTimeInput(attrs={'type': 'datetime-local'})
        }