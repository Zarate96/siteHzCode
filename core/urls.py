from django.urls import include, path
from .views import *

app_name = 'core'

handler404 = 'helpers.views.handle_not_found'
handler500 = 'helpers.views.custom_error_view'

urlpatterns = [
    path('', Inicio.as_view(), name='inicio'),
    path('portafolio/', Portafolio.as_view(), name='portafolio'),
    path('blog/', Blog.as_view(), name='blog'),
    path('contacto/', Contacto.as_view(), name='contacto'),
    path('mensaje/', mensaje, name='mensaje'),
    path('articulo/<slug:slug>/', view=ArticuloDetailView.as_view(), name='articulo'),
    
]

