from django.conf import settings
from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.generic import TemplateView, CreateView, DetailView
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin

from .decorators import check_recaptcha
from .models import Mensajes, Demo, Recomendaciones, Blogs

# Create your views here.
class Inicio(UserPassesTestMixin, TemplateView):
    template_name = 'core/home.html'

    def test_func(self):
        return True
        
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args,**kwargs)
        recomendaciones = Recomendaciones.objects.all()
        blogs = Blogs.objects.all()
        context['title'] = 'Home'
        context['blogs'] = blogs
        context['recomendaciones'] = recomendaciones
        context['google_site_key'] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        return context

class Portafolio(UserPassesTestMixin, TemplateView):
    template_name = 'core/portafolio.html'

    def test_func(self):
        return True
        
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args,**kwargs)
        demos = Demo.objects.all()
        context['title'] = 'Portafolio'
        context['google_site_key'] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        return context

class Blog(UserPassesTestMixin, TemplateView):
    template_name = 'core/blog.html'

    def test_func(self):
        return True
        
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args,**kwargs)
        blogs = Blogs.objects.all()
        context['title'] = 'Blog'
        context['blogs'] = blogs
        context['google_site_key'] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        return context
    
class Contacto(UserPassesTestMixin, TemplateView):
    template_name = 'core/contacto.html'

    def test_func(self):
        return True
        
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args,**kwargs)
        demos = Demo.objects.all()
        context['title'] = 'Contacto'
        context['google_site_key'] = settings.GOOGLE_RECAPTCHA_SITE_KEY
        return context

class ArticuloDetailView(DetailView):
    """Detail post."""
    template_name = 'core/entrada.html'
    model = Blogs
    context_object_name = 'articulo'
    slug_field = 'slug'
    slug_url_kwarg = 'slug'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['facebook_id'] = settings.FACEBOOK_ID
        context['title'] = self.object.titulo
        return context
    
@check_recaptcha
def mensaje(request):
    if request.method == 'POST':
        name = request.POST['name']
        email = request.POST['email']
        subject = request.POST['subject']
        message = request.POST['message']
        phone = request.POST['phone']

    if request.recaptcha_is_valid: 
        mensaje = Mensajes(nombre=name, email=email, asunto=subject, mensaje=message, telefono=phone)
        mensaje.save()
        messages.success(request, 'Tu mensaje ha sido enviado, nos pondremos en contacto contigo en breve.')

    else:
        messages.error(request, 'Porfavor verifique la información')

    return redirect('core:inicio')
    #return render(request, 'pages/home.html', {})