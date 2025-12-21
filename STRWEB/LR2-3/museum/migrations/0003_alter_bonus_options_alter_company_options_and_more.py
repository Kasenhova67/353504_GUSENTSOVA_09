
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('museum', '0002_remove_hall_flor_hall_floor'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='bonus',
            options={'verbose_name': 'Bonus', 'verbose_name_plural': 'Bonuses'},
        ),
        migrations.AlterModelOptions(
            name='company',
            options={'verbose_name': 'Company', 'verbose_name_plural': 'Companies'},
        ),
        migrations.AlterModelOptions(
            name='companystory',
            options={'verbose_name': 'Company story', 'verbose_name_plural': 'Company stories'},
        ),
        migrations.AlterModelOptions(
            name='news',
            options={'verbose_name': 'News', 'verbose_name_plural': 'News'},
        ),
    ]
