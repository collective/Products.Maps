try:
    from cgi import escape
except ImportError:
    from html import escape

from zope.interface import implementer
from zope.component import adapter, getMultiAdapter

from Products.Five.browser import BrowserView

from Products.Maps.interfaces import IRichMarker, IMap, IMapView
from Products.Maps.interfaces import IMapEnabled, IMapEnabledView

try:
    import json
except ImportError:
    import simplejson as json

from zope.annotation.interfaces import IAnnotations


class BaseMapView(BrowserView):
    def __init__(self, context, request):
        """ init view """
        self.context = context
        self.request = request
        self.map = IMap(self.context)
        self.config = getMultiAdapter((context, request), name="maps_configuration")
        marker_icons = self.config.marker_icons
        icons = {}
        for icon in marker_icons:
            icons[icon['name']] = icon
        icons['default'] = marker_icons[0]
        self.icons = icons

    def getMarkers(self):
        if self.map is None:
            return
        for x in self.map.getMarkers():
            if x.longitude is not None:
                yield IRichMarker(x)

    def iconTagForMarker(self, marker):
        icon = self.icons.get(marker.icon, None)
        if icon is None:
            icon = self.icons['default']
        tag = '<img src="%s" alt="%s"' % (icon['icon'], escape(icon['name']))
        tag = tag + ' width="%i" height="%i"' % (icon['iconSize'][0], icon['iconSize'][1])
        tag = tag + ' class="marker" />'
        return tag

    def showContents(self):
        return self.config.show_contents

    def getSavedSettings(self):
        annotations = IAnnotations(self.context)
        try:
            return annotations['Products.Maps.map_settings']
        except KeyError:
            return '{}';


@implementer(IMapView)
@adapter(IMapEnabled)
class DefaultMapView(BaseMapView):

    @property
    def enabled(self):
        if self.map is None:
            return False
        return True


@implementer(IMapView)
class FolderMapView(BaseMapView):

    @property
    def enabled(self):
        if self.map is None:
            return False
        return True


class SaveMapView(BrowserView):
    def __call__(self):
        annotations = IAnnotations(self.context)
        if 'maptype' in self.request.form:
            center = self.request.form.get('center') or self.request.form.get('center[]')

            data = {
                'maptype': self.request.form['maptype'],
                'center' : [float(n) for n in center],
                'zoom' : float(self.request.form['zoom']),
            }
            annotations['Products.Maps.map_settings'] = json.dumps(data)
        else:
            annotations['Products.Maps.map_settings'] = '{}';

        return "ok"

