
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('museum', '0004_delete_employee_positions_alter_vacancy_options'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='exhibitions',
            name='employe',
        ),
    ]
