#
# Test the config view
#

from Products.Five.testbrowser import Browser
from Products.PloneTestCase.PloneTestCase import portal_owner
from Products.PloneTestCase.PloneTestCase import default_password

from Products.Maps.tests import MapsTestCase

from Products.Maps.config import PROPERTY_GOOGLE_KEYS_FIELD
from Products.CMFCore.utils import getToolByName

class TestBrowserConfig(MapsTestCase.MapsFunctionalTestCase):
    def test_control_panel(self):
        browser = Browser()
        browser.addHeader('Authorization', 'Basic %s:%s' %
                          (portal_owner, default_password))
        jstool = self.portal.portal_javascripts
        # This is probably not the best way to test this
        # we want resources to be cooked after a form save
        # so we empty them first
        jstool.cookedresources = ()
        browser.open(self.portal.absolute_url() + '/@@maps-controlpanel')
        browser.getControl('Default coordinates').value = "1.0, 1.5"
        browser.getControl('Save').click()
        self.failUnless(jstool.cookedresources)

class TestConfig(MapsTestCase.MapsTestCase):

    def testViewAvailable(self):
        config = self.folder.restrictedTraverse('@@maps_configuration')

    def testGoogleAPIKey(self):
        for prop, attr in ((PROPERTY_GOOGLE_KEYS_FIELD, 'googlemaps_key'),):
            config = self.folder.restrictedTraverse('@@maps_configuration')
            propertiestool = getToolByName(self.portal, 'portal_properties')
            mapsprops = getattr(propertiestool.aq_base, 'maps_properties')
            # test whether the key is found on exact url match
            mapsprops._updateProperty(prop,
                                      ["http://nohost/plone | MyKey"])
            self.assertEqual(getattr(config, attr), "MyKey")
            # test whether the key is found on partial url match
            mapsprops._updateProperty(prop,
                                      ["http://nohost | MyOtherKey"])
            self.assertEqual(getattr(config, attr), "MyOtherKey")
            # test longest first matching key - one
            mapsprops._updateProperty(prop,
                                      ["http://nohost | MyOtherKey",
                                       "http://nohost/plone | MyKey"])
            self.assertEqual(getattr(config, attr), "MyKey")
            # test longest first matching key - two
            mapsprops._updateProperty(prop,
                                      ["http://nohost/plone | MyKey",
                                       "http://nohost | MyOtherKey"])
            self.assertEqual(getattr(config, attr), "MyKey")
            # test longest first matching key - three
            mapsprops._updateProperty(prop,
                                      ["http://dummy/plone | MyKey",
                                       "http://nohost | MyOtherKey"])
            self.assertEqual(getattr(config, attr), "MyOtherKey")
            # test whitespace stripping
            mapsprops._updateProperty(prop,
                                      ["   http://nohost/plone | MyKey   "])
            self.assertEqual(getattr(config, attr), "MyKey")
            # test no whitespace
            mapsprops._updateProperty(prop,
                                      ["http://nohost/plone|MyKey"])
            self.assertEqual(getattr(config, attr), "MyKey")

            # test trailing slash
            mapsprops._updateProperty(prop,
                                      ["http://nohost/plone/ | MyKey"])
            self.assertEqual(getattr(config, attr), "MyKey")
            mapsprops._updateProperty(prop,
                                      ["http://nohost/plone/ | MyKey",
                                       "http://nohost/ | MyOtherKey"])
            self.assertEqual(getattr(config, attr), "MyKey")
            mapsprops._updateProperty(prop,
                                      ["http://dummy/plone/ | MyKey",
                                       "http://nohost/ | MyOtherKey"])
            self.assertEqual(getattr(config, attr), "MyOtherKey")
            mapsprops._updateProperty(prop,
                                      ["http://dummy/plone/ | MyKey",
                                       "http://nohost | MyOtherKey"])
            self.assertEqual(getattr(config, attr), "MyOtherKey")


def test_suite():
    from unittest import TestSuite, makeSuite
    suite = TestSuite()
    suite.addTest(makeSuite(TestConfig))
    suite.addTest(makeSuite(TestBrowserConfig))
    return suite
