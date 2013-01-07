#
# GE Setup Tests
#

from Products.Maps.tests import MapsTestCase

from Products.Maps.interfaces import IMap, IMapView
from Products.CMFCore.utils import getToolByName

from zope.interface.verify import verifyObject

AddPortalTopics = 'Add portal topics'


class TestAdaption(MapsTestCase.MapsTestCase):

    def afterSetUp(self):
        # add permission to add topics
        perms = self.getPermissionsOfRole('Member')
        self.portal.portal_types['Topic'].global_allow = True
        self.setPermissions(perms + [AddPortalTopics], 'Member')

    def getPermissionsOfRole(self, role):
        perms = self.portal.permissionsOfRole(role)
        return [p['name'] for p in perms if p['selected']]

    def testFolderAdaption(self):
        map = IMap(self.folder)
        self.failUnless(IMap.providedBy(map))
        self.failUnless(verifyObject(IMap, map))

    def testTopicAdaption(self):
        self.folder.invokeFactory('Topic', 'topic')
        map = IMap(self.folder.topic)
        self.failUnless(IMap.providedBy(map))
        self.failUnless(verifyObject(IMap, map))

    def testGoogleMapView(self):
        self.folder.invokeFactory('Topic', 'topic')
        map_view = self.folder.restrictedTraverse('@@maps_googlemaps_view')
        self.failUnless(IMapView.providedBy(map_view))
        self.failUnless(verifyObject(IMapView, map_view))
        map_view = self.folder.topic.restrictedTraverse('@@maps_googlemaps_view')
        self.failUnless(IMapView.providedBy(map_view))
        self.failUnless(verifyObject(IMapView, map_view))


def test_suite():
    from unittest import TestSuite, makeSuite
    suite = TestSuite()
    suite.addTest(makeSuite(TestAdaption))
    return suite
