import logging

from zope.i18nmessageid import MessageFactory

try:
    from Products.Archetypes.public import listTypes
    from Products.Archetypes.public import process_types
    from Products.ATContentTypes import atct
    HAVE_ARCHETYPES = True
except ImportError:
    HAVE_ARCHETYPES = False
from Products.CMFCore.utils import ContentInit
from Products.CMFCore.DirectoryView import registerDirectory

from Products.Maps import config

MapsMessageFactory = MessageFactory('maps')
logger = logging.getLogger("Products.Maps")

registerDirectory(config.SKINS_DIR, config.GLOBALS)


def initialize(context):

    if HAVE_ARCHETYPES:
        from Products.Maps.content import Location
        Location # pyflakes

        content_types, constructors, ftis = process_types(
            listTypes(config.PROJECTNAME), config.PROJECTNAME)

        ContentInit(
            config.PROJECTNAME + ' Content',
            content_types = content_types,
            permission = 'Maps: Add GeoLocation',
            extra_constructors = constructors,
            fti = ftis,
        ).initialize(context)
