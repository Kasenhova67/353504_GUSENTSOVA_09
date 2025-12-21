from django import forms
from django.core.exceptions import ValidationError
from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from .forms import EmployeePositionForm, OrderForm
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from museum import models


class LoginViewTest(TestCase):
    def setUp(self):
        self.user = models.CustomUser.objects.create_user(email='test@gmail.com', password='12345678', username='test')
        self.employee = models.Employee.objects.create(user=self.user)
        self.url = reverse('main')

    def test_login_view(self):
        self.client.login(email='test@gmail.com', password='12345678')
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'main_info.html')


class NewsModelTest(TestCase):
    def setUp(self):
        self.news = models.News.objects.create(title='Test News', content='This is a test news content')

    def test_news_content(self):
        self.assertIsInstance(self.news, models.News)
        self.assertEqual(self.news.title, 'Test News')
        self.assertEqual(self.news.content, 'This is a test news content')


class ReviewModelTest(TestCase):
    def setUp(self):
        self.user = models.CustomUser.objects.create_user(email='test@gmail.com', password='12345678', username='testuser@gmail.com')
        self.client = models.Client.objects.create(user=self.user, company_name='as', legal_entity=True)
        self.review = models.Review.objects.create(author=self.client, rate=8, content='This is a test review')

    def test_review_content(self):
        self.assertIsInstance(self.review, models.Review)
        self.assertEqual(self.review.rate, 8)
        self.assertEqual(self.review.content, 'This is a test review')


class PromocodeModelTest(TestCase):
    def setUp(self):
        self.promocode = models.PromoCode(name="3434", code="3536", discount_percentage=10)

    def test_promocode_content(self):
        self.assertIsInstance(self.promocode, models.PromoCode)
        self.assertEqual(self.promocode.name, "3434")
        self.assertEqual(self.promocode.code, "3536")
        self.assertEqual(self.promocode.discount_percentage, 10)


class AnswerModelTest(TestCase):
    def setUp(self):
        self.answer = models.Answer.objects.create(content='This is a test answer')

    def test_answer_content(self):
        self.assertIsInstance(self.answer, models.Answer)
        self.assertEqual(self.answer.content, 'This is a test answer')


class VacancyModelTest(TestCase):
    def setUp(self):
        self.employee_position = models.EmployeePosition.objects.create(name='n', salary=10)
        self.vacancy = models.Vacancy.objects.create(employee_position=self.employee_position, number_of_this_position=2,
                                              vacancy_description='This is a test vacancy')

    def test_vacancy_content(self):
        self.assertIsInstance(self.vacancy, models.Vacancy)
        self.assertEqual(self.vacancy.number_of_this_position, 2)
        self.assertEqual(self.vacancy.vacancy_description, 'This is a test vacancy')


class BonusModelTest(TestCase):

    def setUp(self):
        self.bonus = models.Bonus.objects.create(
            name="Holiday Discount",
            code="HOLIDAY2024",
            discount_percentage=20
        )

    def test_bonus_creation(self):
        self.assertIsInstance(self.bonus, models.Bonus)
        self.assertEqual(self.bonus.name, "Holiday Discount")
        self.assertEqual(self.bonus.code, "HOLIDAY2024")
        self.assertEqual(self.bonus.discount_percentage, 20)

    def test_bonus_str(self):
        self.assertEqual(str(self.bonus), "HOLIDAY2024")


class CompanyModelTest(TestCase):

    def setUp(self):
        self.company = models.Company.objects.create(
            name="Tech Corp",
            video="https://example.com/video.mp4",
            logo="path/to/logo.png"
        )

    def test_company_creation(self):
        self.assertIsInstance(self.company, models.Company)
        self.assertEqual(self.company.name, "Tech Corp")
        self.assertEqual(self.company.video, "https://example.com/video.mp4")
        self.assertEqual(self.company.logo, "path/to/logo.png")


class CompanyStoryModelTest(TestCase):

    def setUp(self):
        self.company_story = models.CompanyStory.objects.create(
            title="Test Story",
            content="This is a test content.",
            date="2024-05-20"
        )

    def test_company_story_creation(self):
        self.assertTrue(isinstance(self.company_story, models.CompanyStory))
        self.assertEqual(self.company_story.__str__(), self.company_story.title)

    def test_company_story_title(self):
        self.assertEqual(self.company_story.title, "Test Story")

    def test_company_story_content(self):
        self.assertEqual(self.company_story.content, "This is a test content.")

    def test_company_story_date(self):
        self.assertEqual(str(self.company_story.date), "2024-05-20")

    def test_company_story_blank_date(self):
        company_story_blank_date = models.CompanyStory.objects.create(
            title="Story without date",
            content="This story has no date."
        )
        self.assertIsNone(company_story_blank_date.date)


class QuestionModelTest(TestCase):

    def setUp(self):
        self.answer = models.Answer.objects.create(
            content="This is an answer"
        )
        self.question = models.Question.objects.create(
            content="This is a question?",
            date="2024-05-20 12:00:00",
            answer=self.answer
        )

    def test_question_creation(self):
        self.assertTrue(isinstance(self.question, models.Question))
        self.assertEqual(self.question.__str__(), self.question.content)

    def test_question_content(self):
        self.assertEqual(self.question.content, "This is a question?")

    def test_question_date(self):
        self.assertEqual(str(self.question.date), "2024-05-20 12:00:00")

    def test_question_answer_relation(self):
        self.assertEqual(self.question.answer, self.answer)

    def test_question_blank_date(self):
        question_blank_date = models.Question.objects.create(
            content="This question has no date",
            answer=self.answer
        )
        self.assertIsNone(question_blank_date.date)

    def test_get_absolute_url_to_add(self):
        expected_url = reverse('cleaning_service:add_answer', kwargs={'pk': self.question.pk})
        self.assertEqual(self.question.get_absolute_url_to_add(), expected_url)


class EmployeePositionModelTest(TestCase):

    def setUp(self):
        self.employee_position = models.EmployeePosition.objects.create(
            name="Manager",
            salary=50000
        )

    def test_employee_position_creation(self):
        self.assertTrue(isinstance(self.employee_position, models.EmployeePosition))
        self.assertEqual(str(self.employee_position), self.employee_position.name)

    def test_employee_position_name(self):
        self.assertEqual(self.employee_position.name, "Manager")

    def test_employee_position_salary(self):
        self.assertEqual(self.employee_position.salary, 50000)

    def test_get_absolute_url_for_delete(self):
        expected_url = reverse('cleaning_service:delete_employee_position', kwargs={'pk': self.employee_position.pk})
        self.assertEqual(self.employee_position.get_absolute_url_for_delete(), expected_url)

    def test_get_absolute_url_for_update(self):
        expected_url = reverse('cleaning_service:update_employee_position', kwargs={'pk': self.employee_position.pk})
        self.assertEqual(self.employee_position.get_absolute_url_for_update(), expected_url)



class CustomUserModelTest(TestCase):

    def setUp(self):
        self.user = models.CustomUser.objects.create_user(
            username='testuser',
            password='password123',
            email='testuser@example.com',
            age=25,
            telephone='+375290000000'
        )

    def test_custom_user_creation(self):
        self.assertTrue(isinstance(self.user, models.CustomUser))
        self.assertEqual(str(self.user), self.user.username)

    def test_custom_user_email_unique(self):
        with self.assertRaises(ValidationError):
            models.CustomUser.objects.create_user(
                username='testuser2',
                password='password123',
                email='testuser@example.com'
            ).full_clean()

    def test_get_absolute_url_for_delete(self):
        expected_url = reverse('users:delete_user', kwargs={'pk': self.user.pk})
        self.assertEqual(self.user.get_absolute_url_for_delete(), expected_url)

    def test_get_absolute_url_for_update(self):
        expected_url = reverse('users:edit_user', kwargs={'pk': self.user.pk})
        self.assertEqual(self.user.get_absolute_url_for_update(), expected_url)


class EmployeeModelTest(TestCase):

    def setUp(self):
        self.user = models.CustomUser.objects.create_user(
            username='employeeuser',
            password='password123',
            email='employeeuser@example.com',
            age=30
        )
        self.position = models.EmployeePosition.objects.create(
            name='Developer',
            salary=70000
        )
        self.employee = models.Employee.objects.create(
            user=self.user,
            position=self.position,
            image_source=SimpleUploadedFile(name='test_image.jpg', content=b'', content_type='image/jpeg')
        )

    def test_employee_creation(self):
        self.assertTrue(isinstance(self.employee, models.Employee))
        self.assertEqual(str(self.employee), self.employee.user.username)

    def test_employee_position_relation(self):
        self.assertEqual(self.employee.position, self.position)


class ClientModelTest(TestCase):

    def setUp(self):
        self.user = models.CustomUser.objects.create_user(
            username='clientuser',
            password='password123',
            email='clientuser@example.com',
            age=40
        )
        self.client = models.Client.objects.create(
            user=self.user,
            company_name='Test Company',
            legal_entity=True
        )

    def test_client_creation(self):
        self.assertTrue(isinstance(self.client, models.Client))
        self.assertEqual(str(self.client), self.client.user.username)

    def test_client_company_name(self):
        self.assertEqual(self.client.company_name, 'Test Company')

    def test_client_legal_entity(self):
        self.assertTrue(self.client.legal_entity)

    def test_get_absolute_url(self):
        expected_url = reverse('clients', kwargs={'client_id': self.client.id})
        self.assertEqual(self.client.get_absolute_url(), expected_url)


class EmployeePositionFormTest(TestCase):
    def test_form_valid_data(self):
        form_data = {
            'name': 'Manager',
            'salary': 50000,
        }
        form = EmployeePositionForm(data=form_data)
        self.assertTrue(form.is_valid())
        employee_position = form.save()
        self.assertEqual(employee_position.name, 'Manager')
        self.assertEqual(employee_position.salary, 50000)

    def test_form_invalid_data(self):
        form_data = {
            'name': '',
            'salary': 'not_a_number',
        }
        form = EmployeePositionForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)
        self.assertIn('salary', form.errors)

    def test_form_empty_data(self):
        form = EmployeePositionForm(data={})
        self.assertFalse(form.is_valid())
        self.assertIn('name', form.errors)
        self.assertIn('salary', form.errors)

    def test_form_blank_salary(self):
        form_data = {
            'name': 'Cleaner',
            'salary': '',
        }
        form = EmployeePositionForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('salary', form.errors)


class OrderFormTest(TestCase):
    def setUp(self):
        self.user = models.CustomUser.objects.create_user(email='testuser@gmail.com', password='12345678',
                                                   username='testuser@gmail.com')
        self.client = models.Client.objects.create(user=self.user, company_name='as', legal_entity=True)
        self.promocode_instance = models.PromoCode.objects.create(name="PROMO10", code="PROMO10", discount_percentage=10)
        self.bonus_instance = models.Bonus.objects.create(name="BONUS20", code="PROMO10", discount_percentage=20)

    def test_form_valid_data(self):
        form_data = {
            'address': '123 Main St',
            'date_time': timezone.now().strftime("%d/%m/%y %H:%M"),
            'promocode': self.promocode_instance.id,
            'bonus': self.bonus_instance.id,
        }
        form = OrderForm(data=form_data)
        self.assertTrue(form.is_valid())
        order = form.save(commit=False)
        order.client = self.client
        order.save()
        form.save_m2m()  # To handle the many-to-many relationship with services

        self.assertEqual(order.address, '123 Main St')
        self.assertEqual(order.promocode, self.promocode_instance)
        self.assertEqual(order.bonus, self.bonus_instance)

    def test_form_invalid_data(self):
        form_data = {
            'address': '',
            'date_time': 'invalid date format',
        }
        form = OrderForm(data=form_data)
        self.assertFalse(form.is_valid())
        self.assertIn('address', form.errors)
        self.assertIn('date_time', form.errors)

    def test_form_empty_data(self):
        form = OrderForm(data={})
        self.assertFalse(form.is_valid())
        self.assertIn('address', form.errors)
        self.assertIn('date_time', form.errors)

