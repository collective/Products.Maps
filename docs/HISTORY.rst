Changelog
=========

4.0 (unreleased)
----------------

- Increase icon to 24px width for WCAG.
  https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html#dfn-css-pixel
  [frapell]

- Merge the collective.maplocbehavior product here
  [frapell]

- Add Python 3 / Plone 5.2 support
  [enfold-josh, frapell]

- Add compatibility with Plone 5, remove compatibility with Plone 4.
  [davisagli]

3.4 (unreleased)
----------------

- Added back default location [sithmel]
- Removed some inline styling for better customization [sithmel]
- when you changed layers the search was not updated (fixed) [sithmel]
- now you can optionally use radio button for selecting layers [sithmel]
- you can optionally track zoom/position in the URL [sithmel]
- added details in search results [sithmel]
- now layers can be customized using the getValidLayers script
  (inside a skin layer) [sithmel]
- Fixed Plone 4.3 compatibility bug: ``computeRelatedItems`` has been
  removed from Plone [keul]
- Added uninstall profile (properties are kept) [keul]
- Fixed tests dependencies, adding PloneTestCase [keul]
- Provacy: do not display map, but fallback to a simple URL to GMaps
  is a cookie ``maps-optout`` is valued ``true `` [keul]

3.3 (2013-04-05)
----------------

- Store map objects in window.activeMaps to allow end-develops access
  [StevenLooman]
- added title in popup window [giacomos]  


3.2 (2013-03-14)
----------------

- fix on location widget when used as archetype field [sithmel]
- fix on save maps layout buttons (Plone3 only) [sithmel]


3.0 (2013-01-25)
----------------

- Completely refactored js code using Jquery [sithmel]
- Updated to Google API v.3 (reverse geocoding, streetview ecc.) [sithmel]
- Added autocompletion for places [sithmel]
- Fixed Layer feature (based on keywords) [sithmel]
- added search to map view [sithmel]
- Added Italian Translation [sithmel]
- added new plone collection compatibility [sithmel]
- new control panel [sithmel]
- various bugfixes and compatibility tests [keul]

2.1.2 - Unreleased
------------------

- Update for Plone 4.1: include Products.CMFCore to define missing
  permissions. Fix undefined name showContents in default view. [thefunny42]

- Add "Add permission" for Site Administrator too. [thefunny42]

- Add controlpanel option to turn off displaying full item contents in pop-up.
  (http://plone.org/products/maps/issues/34)
  [khink]

2.1.1 - 2011-05-13
------------------

- Force validator registration before use. Avoids spurious warning.
  [ggozad]

- Kicked out qPloneGoogleMaps and Products.geolocation
  [ggozad]

- Fixed broken TestCase.
  [ggozad]

- Updated control panel actions for Plone 4.
  [ggozad]

- Update ILocation interface. Custom content type must implement getMarkerIcon
  method to successfully support LocationMarker adapter.
  [naro]

- Added notes about implementation geolocation field to custom content type.
  [naro]

- Allow maps_map to be used as view template without being the default view
  (http://plone.org/products/maps/issues/32)
  [khink]

- Replace __init__ profile initialization with xml file GS profile setup, so
  we can add Products.Maps as a dependency in another product's Generic Setup
  profile.
  [khink]

- Added Dutch translation
  [kcleong]

2.1.0 - 2010-09-19
------------------

- Update documentation to require Plone 4.x.
  [hannosch]

- Update license to GPL version 2 only.
  [hannosch]

- Removed IndexIterator since it was removed in Plone 4.0.
  [pbauer]

- Added support missing plone domain on i18n directory. Added Spanish
  translation. Updated full support for i18n and generate new template.
  [macagua]

- Improve map initialization when the location field is displayed in an other
  schemata. Merged from branches/map-in-another-schemata.
  Notes: Width and height must be define in the theme's styles, if you put the
  field in an other schemata::

    div.googleMapEdit {
        width:756px; /* must be in pixels */
        height:455px; /* must be in pixels */
        padding-bottom:30px;
    }

  [sylvainb, toutpt]

2.0.3 - 2010-05-07
------------------

- Added missing i18n_domain to the configure.zcml.
  [hannosch]

- Cook javascript resources after control panel submissions.
  [silviot]

2.0.2 - 2010-02-10
------------------

- Added an add permission for GeoLocations to support fine grained control of
  where the content type can be added.
  [rossp]

2.0.1 - 2010-01-19
------------------

- Updated LocationFieldValidator to be compatible with both Plone 3 and 4.
  [hannosch]

2.0 - 2008-09-17
----------------

- Add a metadata.xml to the GenericSetup profile.
  [wichert]

- Refactored to make it easier to use Maps in custom content types. If you
  write a content type and use a field named 'geolocation', then you can use
  default implementations of adapters now instead of writing three on your own.
  [fschulze]

- Moved to common egg file layout. This means there will be no more
  tarball releases, because the docs are outside of the Products folder.
  [fschulze]

- Converted HISTORY.txt and README.txt to reStructureText.
  [fschulze]

- Added a simple buildout configuration to the package, to be able to
  develop and test it on its own.
  [hannosch]

1.2 - July 3, 2008
------------------

- Added greek translation.
  [ggozad]

- Updated templates for Plone 3.0.
  [fschulze]

- Dropped compatibility with Plone 2.5.
  [fschulze]

1.1 - September 05, 2007
------------------------

- Fixed the logic when to show layers.
  [fschulze]

- Fixed viewing of maps if the workflow state was 'private'. There is a
  new interface and view which only has the 'enabled' attribute and which
  is accessible without restriction. This is now used as the condition in
  portal_javascripts.
  [fschulze]

- The coordinates field now uses a tuple with two floats everywhere. The
  widget for it now uses two input fields.
  [fschulze]

- Made LinguaPlone aware.
  [fschulze]

- Added custom view for locations. The map is smaller at the upper right
  and the rich text is shown besides it.
  [fschulze]

1.1rc1 - May 17, 2007
---------------------

- Added configlet for Plone 3.0.
  [fschulze]

- Fixed scrolling of map when clicking on pin. This only happend when
  there were no layers.
  [fschulze]

- Fixed functionality of layer checkboxes for IE6/7.
  [fschulze]

- Fixed key lookup when the URL has a trailing slash.
  [fschulze]

- Added fallback to Google AJAX Search if the Google Maps geocoding did
  not return any results. This allows you to search for cities i.e. the
  UK and China.
  [fschulze]

1.0 - May 03, 2007
------------------

- Changed the markup. All markers are in one definition list instead of
  one marker in one list. A dt with class="title" marks the beginning of
  a new marker.
  [fschulze]

- Added support for layers. The default is to take keywords as the name
  of the layer in which a marker is visible. Then you get a map control
  with checkboxes for each keyword and you can view/hide the markers with
  that.
  [fschulze]

- Using GenericSetup for installation.
  [fschulze]

- Added support for existing qPloneGoogleMaps markers.
  Added support of content with location from the geolocation product.
  [fschulze]

- Added RichText field to Location objects.
  [fschulze]

- Added support for tabbed info windows.
  [fschulze]


0.5 - April 02, 2007
--------------------

- Initial public release.
  [fschulze]
