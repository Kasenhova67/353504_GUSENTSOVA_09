from django.contrib.auth.models import AbstractUser, Permission, Group
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.urls import reverse
from django.utils import timezone



class PartnerCompany(models.Model):
    name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='partners/', null=True, blank=True)
    website = models.URLField(max_length=500)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Partner Company'
        verbose_name_plural = 'Partner Companies'
        
class Hall(models.Model):
    name = models.CharField("Name", max_length=50)
    nomer = models.IntegerField("Nomer", default=None)
    floor = models.IntegerField("floor", default=None)
    square = models.IntegerField("Square", default=None)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Hall'
        verbose_name_plural = 'Halls'


class EmployeePosition(models.Model):
    name = models.CharField(max_length=255)
    salary = models.IntegerField()

    def get_absolute_url_for_delete(self):
        return reverse('delete_employee_position', kwargs={'pk': self.pk})

    def get_absolute_url_for_update(self):
        return reverse('update_employee_position', kwargs={'pk': self.pk})

    def __str__(self):
        return self.name


class CustomUser(AbstractUser):
    date_of_birth = models.DateField(blank=True, null=True)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=13, null=True, default='+375290000000')

    def get_absolute_url_for_delete(self):
        return reverse('delete_user', kwargs={'pk': self.pk})

    def __str__(self):
        return self.username

    class Meta:
        verbose_name = 'CustomUser'
        verbose_name_plural = 'CustomUsers'

class Client(models.Model):
    user = models.OneToOneField('museum.CustomUser', on_delete=models.CASCADE, null=True, blank=True)
    company_name = models.CharField(max_length=255, null=True)

    def get_active_cart_items_count(self):
        active_cart = self.cart_set.filter(is_ordered=False).first()
        return active_cart.items.count() if active_cart else 0

    def __str__(self):
        return self.user.username

class Art_form(models.Model):
    name = models.CharField("Name", max_length=50)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Art_form'
        verbose_name_plural = 'Art_forms'


class Exhibit(models.Model):
    name = models.CharField("Name", max_length=50)
    art = models.ForeignKey(Art_form, related_name="Art", on_delete=models.CASCADE, default=None)
    date = models.DateTimeField('Date', default=None)
    hall = models.ForeignKey(Hall, related_name="Hal", on_delete=models.CASCADE)
    image_source = models.ImageField(upload_to='images/', null=True, blank=True)
    keeper = models.ForeignKey('Employee', on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Exhibit'
        verbose_name_plural = 'Exhibits'


class Employee(models.Model):
    user = models.OneToOneField('museum.CustomUser', on_delete=models.CASCADE, null=True, blank=True)
    image_source = models.ImageField(upload_to='images/', null=True, blank=True)
    job = models.ForeignKey(EmployeePosition, on_delete=models.SET_NULL, null=True)
    hall = models.ForeignKey(Hall, related_name="Haall", on_delete=models.CASCADE, default=None)
    exhibits = models.ManyToManyField(Exhibit)
    exhibitions = models.ManyToManyField('Exhibitions')

    def __str__(self):
        return self.user.username


class Exhibitions(models.Model):
    name = models.CharField("Name", max_length=50)
    date = models.DateTimeField('Date')
    people = models.IntegerField("People")
    code = models.IntegerField("Code")
    cost = models.IntegerField("Cost")
    hall = models.ForeignKey(Hall, related_name="Hall", on_delete=models.CASCADE)
    # employe = models.ForeignKey(Employee, related_name="Employ", on_delete=models.CASCADE, null=True, blank=True)

    def get_absolute_url_for_delete(self):
        return reverse('delete_service_type')

    def get_absolute_url_for_update(self):
        return reverse('update_service_type')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Exhibition'
        verbose_name_plural = 'Exhibitions'


class Question(models.Model):
    content = models.TextField()
    date = models.DateTimeField(null=True, blank=True)
    answer = models.ForeignKey('Answer', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.content

    def get_absolute_url_to_add(self):
        return reverse('add_answer', kwargs={'pk': self.pk})


class Answer(models.Model):
    content = models.TextField()
    date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.content


class Vacancy(models.Model):
    employee_position = models.ForeignKey(EmployeePosition, on_delete=models.CASCADE)
    number_of_this_position = models.IntegerField()
    vacancy_description = models.TextField()

    def get_absolute_url_for_delete(self):
        return reverse('delete_vacancy', kwargs={'pk': self.pk})

    def get_absolute_url_for_update(self):
        return reverse('update_vacancy', kwargs={'pk': self.pk})

    def __str__(self):
        return f'{self.employee_position.__str__()} {self.number_of_this_position}'

    class Meta:
        verbose_name = 'Vacancy'
        verbose_name_plural = 'Vacancies'


class Review(models.Model):
    author = models.ForeignKey(Client, on_delete=models.CASCADE)
    rate = models.IntegerField()
    content = models.TextField()
    date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
          return f'{self.author.user.get_full_name() or self.author.user.username} - {self.content[:50]}...'


class PromoCode(models.Model):
    name = models.CharField(max_length=255, null=True)
    code = models.CharField(max_length=255)
    discount_percentage = models.IntegerField(default=None)

    def __str__(self):
        return self.code


class Bonus(models.Model):
    name = models.CharField(max_length=255, null=True)
    code = models.CharField(max_length=255)
    discount_percentage = models.IntegerField()

    def __str__(self):
        return self.code

    class Meta:
        verbose_name = 'Bonus'
        verbose_name_plural = 'Bonuses'


class Company(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название компании")
    description = models.TextField(verbose_name="Описание компании")
    logo = models.ImageField(upload_to='company/logo/', null=True, blank=True, verbose_name="Логотип")
    video = models.FileField(upload_to='company/video/', null=True, blank=True, verbose_name="Видео")
    website = models.URLField(max_length=500, blank=True, verbose_name="Вебсайт")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Компания'
        verbose_name_plural = 'Компании'


class CompanyHistory(models.Model):
    YEAR_CHOICES = [(year, year) for year in range(2000, 2031)]
    
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='histories')
    year = models.IntegerField(choices=YEAR_CHOICES, verbose_name="Год")
    title = models.CharField(max_length=255, verbose_name="Заголовок события")
    description = models.TextField(verbose_name="Описание события")
    
    def __str__(self):
        return f"{self.year} - {self.title}"

    class Meta:
        verbose_name = 'История компании'
        verbose_name_plural = 'История компании'
        ordering = ['-year']


class CompanyRequisite(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='requisites')
    title = models.CharField(max_length=255, verbose_name="Название реквизита")
    value = models.CharField(max_length=500, verbose_name="Значение")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Реквизит'
        verbose_name_plural = 'Реквизиты'


class CompanyCertificate(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name='certificates')
    title = models.CharField(max_length=255, verbose_name="Название сертификата")
    description = models.TextField(verbose_name="Описание сертификата")
    image = models.ImageField(upload_to='company/certificates/', verbose_name="Изображение сертификата")
    issue_date = models.DateField(verbose_name="Дата выдачи")
    
    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Сертификат'
        verbose_name_plural = 'Сертификаты'


class News(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_source = models.ImageField(null=True, blank=True)
    date = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'News'
        verbose_name_plural = 'News'


# class Order(models.Model):
#     client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True)
#     exhibitions = models.ForeignKey(Exhibitions, on_delete=models.CASCADE)
#     promocode = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
#     bonus = models.ForeignKey(Bonus, on_delete=models.SET_NULL, null=True, blank=True)

#     def get_absolute_url_to_add(self):
#         return reverse('add_service_to_order', kwargs={'pk': self.pk})

#     def get_absolute_url_to_more_info(self):
#         return reverse('order_details', kwargs={'pk': self.pk})

#     def get_total_price(self):
#         total_price = self.exhibitions.cost
#         if self.bonus != None and self.promocode != None:
#             total_price *= (100 - (self.bonus.discount_percentage + self.promocode.discount_percentage)) / 100

#         return total_price

#     def __str__(self):
#         return str(self.pk)

class Cart(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_ordered = models.BooleanField(default=False)
    
    def get_total_price(self):
        return sum(item.get_total_item_price() for item in self.items.all())
    
    def __str__(self):
        return f"Cart #{self.id} - {self.client.user.username}"

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items', on_delete=models.CASCADE)
    exhibition = models.ForeignKey(Exhibitions, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    added_at = models.DateTimeField(auto_now_add=True)
    
    def get_total_item_price(self):
        return self.exhibition.cost * self.quantity
    
    def __str__(self):
        return f"{self.quantity} x {self.exhibition.name}"



class Order(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True)
    cart = models.OneToOneField(Cart, on_delete=models.CASCADE, null=True)
    exhibitions = models.ForeignKey(Exhibitions, on_delete=models.CASCADE, null=True, blank=True)
    promocode = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
    bonus = models.ForeignKey(Bonus, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_paid = models.BooleanField(default=False)
    
    def get_total_price(self):
        if self.cart:
            total_price = self.cart.get_total_price()
        else:
            total_price = self.exhibitions.cost
        
        if self.bonus and self.promocode:
            total_price *= (100 - (self.bonus.discount_percentage + self.promocode.discount_percentage)) / 100
        elif self.bonus:
            total_price *= (100 - self.bonus.discount_percentage) / 100
        elif self.promocode:
            total_price *= (100 - self.promocode.discount_percentage) / 100
            
        return total_price

    def __str__(self):
        return str(self.pk)