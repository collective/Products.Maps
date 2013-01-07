# -*- coding: utf8 -*-

from Products.Maps import logger

from Products.CMFCore.utils import getToolByName

_PROPERTIES = [
    dict(name='map_markers', type_='lines',
         value=['Name | Icon | iconSize | iconAnchor | infoWindowAnchor | Shadow | shadowSize | infoShadowAnchor',
                'Red Marker     | marker-red.png       | 20,34 | 9,34 | 9,2 | shadow50.png | 37,34 | 18,25',
                'Green Marker   | marker-green.png     | 20,34 | 9,34 | 9,2 | shadow50.png | 37,34 | 18,25',
                'Blue Marker    | marker-blue.png      | 20,34 | 9,34 | 9,2 | shadow50.png | 37,34 | 18,25',
                'Yellow Marker  | marker-yellow.png    | 20,34 | 9,34 | 9,2 | shadow50.png | 37,34 | 18,25',
                'Magenta Marker | marker-magenta.png   | 20,34 | 9,34 | 9,2 | shadow50.png | 37,34 | 18,25',
                '_yah           | marker-you-are-here.png   | 20,34 | 9,34 | 9,2 | shadow-you-are-here.png | 37,34 | 18,25',
                ]),
    dict(name='map_google_api3_keys', type_='string', value=''),
    dict(name='map_default_maptype', type_='string', value='roadmap'),
    dict(name='map_show_contents', type_='boolean', value=True),
    dict(name='map_layers_active', type_='boolean', value=True),
    dict(name='map_search_active', type_='boolean', value=False),
]

def registerProperties(portal):
    ptool = getToolByName(portal, 'portal_properties')
    props = ptool.maps_properties
    
    for prop in _PROPERTIES:
        if not props.hasProperty(prop['name']):
            props.manage_addProperty(prop['name'], prop['value'], prop['type_'])
            logger.info("Added missing %s property" % prop['name'])
        if prop['type_']=='lines':
            map_markers = list(getattr(props,prop['name'], []))
            for p in prop['value']:
                if p not in map_markers:
                    map_markers.append(p)
                    logger.info("Inner value missing for property %s. Adding it." % prop['name'])
                props.manage_changeProperties(**{prop['name'] : map_markers})
        else:
            logger.info("Property %s found. Skipping" % prop['name'])

def setupVarious(context):
    if context.readDataFile('Products.map_various.txt') is None:
        return
    
    portal = context.getSite()
    registerProperties(portal)

