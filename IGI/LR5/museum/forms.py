from datetime import date

from django import forms
from django.forms import DateTimeInput

from .models import Review, Question, Answer, Vacancy, Order
from museum.models import CustomUser, Client, Employee, EmployeePosition, Exhibitions,Exhibit
from .mixins import ValidationMixin


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