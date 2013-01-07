import logging

from zope.i18nmessageid import MessageFactory

from Products.Archetypes.public import listTypes
from Products.Archetypes.public import process_types
from Products.CMFCore.utils import ContentInit
from Products.CMFCore.DirectoryView import registerDirectory

from Products.Maps import config

MapsMessageFactory = MessageFactory('maps')
logger = logging.getLogger("Products.Maps")

registerDirectory(config.SKINS_DIR, config.GLOBALS)


def initialize(context):

    from Products.Maps import content
    content # pyflakes

    content_types, constructors, ftis = process_types(
        listTypes(config.PROJECTNAME), config.PROJECTNAME)

    ContentInit(
        config.PROJECTNAME + ' Content',
        content_types = content_types,
        permission = 'Maps: Add GeoLocation',
        extra_constructors = constructors,
        fti = ftis,
    ).initialize(context)
