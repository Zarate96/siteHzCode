from django.db import models
from django.utils import timezone
from ckeditor.fields import RichTextField
from django.utils.text import slugify

# Create your models here.
class Mensajes(models.Model):
    nombre = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    telefono = models.CharField(max_length=100)
    fecha = models.DateTimeField(default=timezone.now)
    asunto = models.CharField(max_length=100)
    mensaje = models.TextField(blank=True)
    is_answered = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = "Mensajes"

    def __str__(self):
        return f"Mensaje enviado por {self.email} el día {self.fecha}, respondido: {self.is_answered} "

class Demo(models.Model):
    nombre = models.CharField(max_length=100)
    url_pag = models.CharField(max_length=100)
    descripcion = models.CharField(max_length=100)
    fecha = models.DateTimeField(default=timezone.now)
    url_foto = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre
