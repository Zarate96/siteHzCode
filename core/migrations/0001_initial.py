# Generated by Django 3.2 on 2022-09-02 22:51

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Demo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('url_pag', models.CharField(max_length=100)),
                ('descripcion', models.CharField(max_length=100)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('url_foto', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='Mensajes',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=100)),
                ('email', models.CharField(max_length=100)),
                ('telefono', models.CharField(max_length=100)),
                ('fecha', models.DateTimeField(default=django.utils.timezone.now)),
                ('asunto', models.CharField(max_length=100)),
                ('mensaje', models.TextField(blank=True)),
                ('is_answered', models.BooleanField(default=False)),
            ],
            options={
                'verbose_name_plural': 'Mensajes',
            },
        ),
    ]