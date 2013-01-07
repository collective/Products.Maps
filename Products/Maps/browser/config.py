from zope.interface import implements

from Products.Five.browser import BrowserView

from Products.Maps.config import *
from Products.Maps.interfaces import IMapsConfig
from Products.Maps.validator import LocationFieldValidator

from Products.CMFCore.utils import getToolByName

from Products.Maps import MapsMessageFactory as _

def getSizeFromString(s):
    values = s.split(",")
    # return a list so the data can be used unchanged in javascript
    return [int(values[0]), int(values[1])]


class MapsConfig(BrowserView):

    implements(IMapsConfig)

    def __init__(self, context, request):
        """ init view """
        self.context = context
        self.request = request
        portal_props = getToolByName(context, 'portal_properties')
        self.properties = getattr(portal_props, PROPERTY_SHEET, None)

    @property
    def googlemaps_keys(self):
        if self.properties is None:
            return ""
        googlemaps_keys = getattr(self.properties,
                                   PROPERTY_GOOGLE_KEYS_FIELD,
                                   "")
        return googlemaps_keys

    @property
    def marker_icons(self):
        if self.properties is None:
            return {}
        icons_list = getattr(self.properties, PROPERTY_MARKERS_FIELD, None)
        if icons_list is None:
            return {}
        portal_url_tool = getToolByName(self.context, 'portal_url')
        portal_url = portal_url_tool()
        icons = []
        for icon in icons_list:
            parts = icon.split("|")
            if parts[0].strip() == "Name":
                continue
            data = {
                'name': _(parts[0].strip()).encode('utf-8'),
                'icon': "%s/%s" % (portal_url, parts[1].strip()),
                'iconSize': getSizeFromString(parts[2]),
                'iconAnchor': getSizeFromString(parts[3]),
                'infoWindowAnchor': getSizeFromString(parts[4]),
                'shadow': "%s/%s" % (portal_url, parts[5].strip()),
                'shadowSize': getSizeFromString(parts[6]),
                'infoShadowAnchor': getSizeFromString(parts[7]),
            }
            icons.append(data)

        return icons

#    @property
#    def default_location(self):
#        if self.properties is None:
#            return (0.0, 0.0)
#        default_location = getattr(self.properties,
#                                   PROPERTY_DEFAULT_LOCATION_FIELD,
#                                   (0.0, 0.0))
#        if isinstance(default_location, basestring):
#            default_location = default_location.split(',')
#        validator = LocationFieldValidator('default_location')
#        if validator(default_location) != 1:
#            return (0.0, 0.0)
#        return default_location

    @property
    def default_maptype(self):
        if self.properties is None:
            return "roadmap"
        default_maptype = getattr(self.properties,
                                   PROPERTY_DEFAULT_MAPTYPE_FIELD,
                                   "roadmap")
        return default_maptype

    @property
    def show_contents(self):
        if self.properties is None:
            return True
        show_contents = getattr(self.properties,
                                   PROPERTY_SHOW_CONTENTS,
                                   True)
        return show_contents
        
    @property
    def layers_active(self):
        if self.properties is None:
            return True
        layers_active = getattr(self.properties,
                                   PROPERTY_LAYERS_ACTIVE,
                                   True)
        return layers_active

    @property
    def search_active(self):
        if self.properties is None:
            return False
        search_active = getattr(self.properties,
                                   PROPERTY_SEARCH_ACTIVE,
                                   False)
        return search_active
