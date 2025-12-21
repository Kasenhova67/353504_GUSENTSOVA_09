
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('museum', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='hall',
            name='flor',
        ),
        migrations.AddField(
            model_name='hall',
            name='floor',
            field=models.IntegerField(default=None, verbose_name='floor'),
        ),
    ]
