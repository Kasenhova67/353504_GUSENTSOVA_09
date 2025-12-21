
import django.contrib.auth.models
import django.contrib.auth.validators
import django.core.validators
import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Answer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('date', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Art_form',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Name')),
            ],
            options={
                'verbose_name': 'Art_form',
                'verbose_name_plural': 'Art_forms',
            },
        ),
        migrations.CreateModel(
            name='Bonus',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, null=True)),
                ('code', models.CharField(max_length=255)),
                ('discount_percentage', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Company',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('video', models.FileField(blank=True, null=True, upload_to='images/')),
                ('logo', models.ImageField(blank=True, max_length=255, null=True, upload_to='')),
            ],
        ),
        migrations.CreateModel(
            name='CompanyStory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('content', models.TextField()),
                ('date', models.DateField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Employee_positions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Name')),
            ],
            options={
                'verbose_name': 'Employee_position',
                'verbose_name_plural': 'Employee_positions',
            },
        ),
        migrations.CreateModel(
            name='EmployeePosition',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('salary', models.IntegerField()),
            ],
        ),
        migrations.CreateModel(
            name='Hall',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Name')),
                ('nomer', models.IntegerField(default=None, verbose_name='Nomer')),
                ('flor', models.IntegerField(default=None, verbose_name='Flor')),
                ('square', models.IntegerField(default=None, verbose_name='Square')),
            ],
            options={
                'verbose_name': 'Hall',
                'verbose_name_plural': 'Halls',
            },
        ),
        migrations.CreateModel(
            name='News',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=255)),
                ('content', models.TextField()),
                ('image_source', models.ImageField(blank=True, null=True, upload_to='')),
                ('date', models.DateTimeField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='PromoCode',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, null=True)),
                ('code', models.CharField(max_length=255)),
                ('discount_percentage', models.IntegerField(default=None)),
            ],
        ),
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('username', models.CharField(error_messages={'unique': 'A user with that username already exists.'}, help_text='Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.', max_length=150, unique=True, validators=[django.contrib.auth.validators.UnicodeUsernameValidator()], verbose_name='username')),
                ('first_name', models.CharField(blank=True, max_length=150, verbose_name='first name')),
                ('last_name', models.CharField(blank=True, max_length=150, verbose_name='last name')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('age', models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(18), django.core.validators.MaxValueValidator(100)])),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('telephone', models.CharField(default='+375290000000', max_length=13, null=True)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'CustomUser',
                'verbose_name_plural': 'CustomUsers',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(max_length=255, null=True)),
                ('legal_entity', models.BooleanField()),
                ('user', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Employee',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image_source', models.ImageField(blank=True, null=True, upload_to='images/')),
                ('user', models.OneToOneField(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('job', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='museum.employeeposition')),
            ],
        ),
        migrations.CreateModel(
            name='Exhibit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Name')),
                ('date', models.DateTimeField(default=None, verbose_name='Date')),
                ('image_source', models.ImageField(blank=True, null=True, upload_to='images/')),
                ('art', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='Art', to='museum.art_form')),
                ('keeper', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='museum.employee')),
                ('hall', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Hal', to='museum.hall')),
            ],
            options={
                'verbose_name': 'Exhibit',
                'verbose_name_plural': 'Exhibits',
            },
        ),
        migrations.AddField(
            model_name='employee',
            name='exhibits',
            field=models.ManyToManyField(to='museum.exhibit'),
        ),
        migrations.CreateModel(
            name='Exhibitions',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=50, verbose_name='Name')),
                ('date', models.DateTimeField(verbose_name='Date')),
                ('people', models.IntegerField(verbose_name='People')),
                ('code', models.IntegerField(verbose_name='Code')),
                ('cost', models.IntegerField(verbose_name='Cost')),
                ('employe', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='Employ', to='museum.employee')),
                ('hall', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Hall', to='museum.hall')),
            ],
            options={
                'verbose_name': 'Exhibition',
                'verbose_name_plural': 'Exhibitions',
            },
        ),
        migrations.AddField(
            model_name='employee',
            name='exhibitions',
            field=models.ManyToManyField(to='museum.exhibitions'),
        ),
        migrations.AddField(
            model_name='employee',
            name='hall',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='Haall', to='museum.hall'),
        ),
        migrations.CreateModel(
            name='Order',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bonus', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='museum.bonus')),
                ('client', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='museum.client')),
                ('exhibitions', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='museum.exhibitions')),
                ('promocode', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='museum.promocode')),
            ],
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('date', models.DateTimeField(blank=True, null=True)),
                ('answer', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='museum.answer')),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('rate', models.IntegerField()),
                ('content', models.TextField()),
                ('date', models.DateTimeField(blank=True, null=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='museum.client')),
            ],
        ),
        migrations.CreateModel(
            name='Vacancy',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number_of_this_position', models.IntegerField()),
                ('vacancy_description', models.TextField()),
                ('employee_position', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='museum.employeeposition')),
            ],
        ),
    ]
