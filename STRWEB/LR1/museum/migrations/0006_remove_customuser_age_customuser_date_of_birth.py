
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('museum', '0005_remove_exhibitions_employe'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='age',
        ),
        migrations.AddField(
            model_name='customuser',
            name='date_of_birth',
            field=models.DateField(blank=True, null=True),
        ),
    ]
