from django.contrib.auth.models import AbstractUser, Permission, Group
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models
from django.urls import reverse


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
    name = models.CharField(max_length=255)
    video = models.FileField(upload_to='images/', null=True, blank=True)
    logo = models.ImageField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Company'
        verbose_name_plural = 'Companies'


class CompanyStory(models.Model):
    title = models.CharField(max_length=255)
    content = models.TextField()
    date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Company story'
        verbose_name_plural = 'Company stories'


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


class Order(models.Model):
    client = models.ForeignKey(Client, on_delete=models.CASCADE, null=True)
    exhibitions = models.ForeignKey(Exhibitions, on_delete=models.CASCADE)
    promocode = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
    bonus = models.ForeignKey(Bonus, on_delete=models.SET_NULL, null=True, blank=True)

    def get_absolute_url_to_add(self):
        return reverse('add_service_to_order', kwargs={'pk': self.pk})

    def get_absolute_url_to_more_info(self):
        return reverse('order_details', kwargs={'pk': self.pk})

    def get_total_price(self):
        total_price = self.exhibitions.cost
        if self.bonus != None and self.promocode != None:
            total_price *= (100 - (self.bonus.discount_percentage + self.promocode.discount_percentage)) / 100

        return total_price

    def __str__(self):
        return str(self.pk)


