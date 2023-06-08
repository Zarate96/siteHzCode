from django.contrib import admin
from .models import Mensajes, Demo, Recomendaciones, Blogs

# Register your models here.
@admin.register(Demo)
class DemoAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'url_pag')
    search_fields = ('nombre','url_pag',)
    list_per_page = 10

@admin.register(Mensajes)
class MensajestAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'email', 'asunto', 'is_answered')
    search_fields = ('nombre', 'email')
    list_per_page = 10

@admin.register(Recomendaciones)
class RecomendacionesAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'puesto')
    search_fields = ('nombre', 'puesto')
    list_per_page = 10

@admin.register(Blogs)
class BlogsAdmin(admin.ModelAdmin):
    list_display = ('id', 'titulo', 'fecha')
    search_fields = ('titulo', 'fecha')
    list_per_page = 10


