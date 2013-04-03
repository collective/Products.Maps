/*global google:true, jQuery:true*/
(function ($, w){
"use strict";

var _all_icons, _all_shadows;
/*
    create a single location object from a dom node
*/

var _createLocation = function($node) {

    return {
        title: $node.find('.title').text().replace(/^\s+|\s+$/g, ''),
        link: $node.find('.title a').attr('href'),
        info_window: (function (){
            var $wrapper = $('<div/>'),
                $tabs, $handlers;
            $node.find('.title').clone().appendTo($wrapper);
            $node.find('.tab').clone().appendTo($wrapper);

            $tabs = $wrapper.find('.tab');
            // create tabs
            if ($tabs.length > 1){
                $handlers = $('<div class="infowindowTabHandlers" />');

                $tabs.each(function (){
                    var $this = $(this);
                    var title = $this.attr('title');
                    var $handler = $('<div class="infowindowTabHandler">' + title + '</div>').click(function (){
                        $tabs.not($this).hide();
                        $this.show();
                        $(this).addClass('selected').siblings().removeClass('selected');
                    });
                    $handlers.append($handler);
                });
                $handlers.find('.infowindowTabHandler').eq(0).click();
                $wrapper.prepend($handlers);
            }

            return new google.maps.InfoWindow({
                content: $wrapper.get(0)
            });
        }()),
        marker: (function (){
            var icon_name = $node.find('img.marker').attr('alt'),
                $geo = $node.find('.geo'),
                position = new google.maps.LatLng(parseFloat($geo.find('.latitude').text()),
                                                  parseFloat($geo.find('.longitude').text()));
            var marker_title = $node.find('.title a').text();
            return new google.maps.Marker({
                title: marker_title,
                icon: _all_icons[icon_name],
                shadow:_all_shadows[icon_name],
                position: position
            });
        }()),
        layers: $node.find('.layers li').map(function (){
            return $(this).text();
        }).get()

    };

};

/*
    create all locations
*/

var _createLocations = function($node, map) {
    var $lists = $node.children("ul").children('li'),
        out = [];

    $lists.each(function (){
        var $this = $(this),
            loc = _createLocation($this);

        google.maps.event.addListener(loc.marker, 'click', function (){
            loc.info_window.open(map, loc.marker);
        });

        google.maps.event.addListener(loc.marker, 'dblclick', function (){
            map.panTo(loc.marker.getPosition());
        });

        loc.marker.setMap(map);

        out.push(loc);
    });

    return out;
};

/*
    extract the layer list merging the layer of all locations
*/
var _getLayersList = function(locations){
    var layers = [];
    $.each(locations,function (){
        $.each(this.layers, function (){
            var s = this.toString();
            if ($.inArray(s, layers) === -1){
                layers.push(s);
            }
        });
    });
    return layers;
};

/*
    convert latLng to a string and write to an input
*/

var _reverseGeocoding = function (latLng, $search_text){
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({'latLng': latLng}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK && results[0]) {
            $search_text.val(results[0].formatted_address);
        }
        else {
            $search_text.val(latLng.lat() + ', ' + latLng.lng());
        }
    });
};

/*
    set up the location autocomplete
*/

var _setupGeocoder = function ($search_text, $search_button, callback){
    var geocoder = new google.maps.Geocoder();
    $search_text.autocomplete({
        delay: 500,
        //This bit uses the geocoder to fetch address values
        source: function(request, response) {
            geocoder.geocode( {'address': request.term }, function(results, status) {
                response($.map(results, function(item) {
                    return {
                        label:  item.formatted_address,
                        value: item.formatted_address,
                        latitude: item.geometry.location.lat(),
                        longitude: item.geometry.location.lng()
                    };
                }));
            });
        },
        //This bit is executed upon selection of an address
        select: function(event, ui) {
            callback(new google.maps.LatLng(ui.item.latitude, ui.item.longitude));
        }
    });
    $search_button.click(function (){
        geocoder.geocode( {'address': $search_text.val() }, function(results, status) {
            if(status === google.maps.GeocoderStatus.OK && results[0]){
                $search_text.val(results[0].formatted_address);
                callback(results[0].geometry.location);
            }
        });

    });
};

/*
    add the layer control to a map
*/

var _addLayerControl = function (layers, map, locations){
    var layeractive = layers,
        $layerControlDiv = $('<div />')
        .css('background-color', 'white')
        .css('border-color','#A9BBDF')
        .css('border-style','solid')
        .css('border-width','0 1px 1px')
        .css('box-shadow','2px 2px 3px rgba(0, 0, 0, 0.35)')
        .css('margin-right','5px'),
    _update_layers = function (){
        var layersActive = [];
        $(this).find('input:checked').each(function (){
            layersActive.push($(this).val());
        });
        $.each(locations, function (){
            var visibility = false,
                layers = this.layers,
                i, len;
            if (layers.length === 0){
                visibility = true;
            }
            else {
                for(i = 0, len = layersActive.length;i < len;i++){
                    if ($.inArray(layersActive[i], layers) !== -1){
                        visibility = true;
                    }
                }
            }
            this.marker.setVisible(visibility);
        });
    };

    // add and initialize the layers
    $.each(layers, function (index, value){
        var i = 'layer' + index;

        $('<div><label for="' + i + '"><input type="checkbox" checked="checked" id="' + i +'" value="' + value + '" />' + value + '</label></div>')
        .appendTo($layerControlDiv).css('padding','2px');
    });

    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push($layerControlDiv.get(0));

    $layerControlDiv.click(_update_layers);

    _update_layers.apply($layerControlDiv.get(0));
};

/*
    set the map's zoom.
    Based on:
    1 - saved settings
    2 - locations

*/

var _set_zoom = function (map, locations){
    var bounds;
    if(w.mapsConfig.settings.center && w.mapsConfig.settings.zoom){
        var c = w.mapsConfig.settings.center;
        map.setCenter(new google.maps.LatLng(c[0], c[1]));
        map.setZoom(w.mapsConfig.settings.zoom);
    }
    else {
        if (locations.length === 1){
            map.setCenter(locations[0].marker.getPosition());
            map.setZoom(16);
        }
        else {
            bounds = (function (locations){
                var out = new google.maps.LatLngBounds();
                $.each(locations, function (){
                    out.extend(this.marker.getPosition());
                });
                return out;
            }(locations));
            map.fitBounds(bounds);
        }
    }

};

/*
    map search
*/

var _searchForm = function($this, locations, map, marker_imhere){
    var $search, $directions, $search_text, $search_button, $reset_button,
        $search_results, directionsRenderer, _search_results;

    // init

    $this.wrap('<div class="googleMapWrapper" />');

    $search = $([
'<div>',
'<div class="googleMapSearchBar">' + w.mapsConfig.i18n.label_searchnearto + '</div>',
'<div class="googleMapSearch">',
'<h4 class="label_search">' + w.mapsConfig.i18n.label_searchnearto + '</h4>',
'<input type="text" value="" placeholder="' + w.mapsConfig.i18n.label_city_address + '" title="' + w.mapsConfig.i18n.label_city_address + '" name="searchtxt" class="googleMapImHere inputLabel inputLabelActive">',
'<br>',
'<input class="searchButton" type="submit" value="' + w.mapsConfig.i18n.label_search + '">',
'<input class="searchButton" type="reset" value="' + w.mapsConfig.i18n.label_cancel + '">',
'<div class="googleMapSearchResults">',
'</div>',
'</div>',
'</div>'
].join('')).insertBefore($this);

    $directions = $('<div class="googleMapDirections"></div>').insertAfter($this);

    $search_text = $search.find('.googleMapImHere');

    $search_button = $search.find(':submit');

    $reset_button = $search.find(':reset');

    $search_results = $search.find('.googleMapSearchResults');

    directionsRenderer = new google.maps.DirectionsRenderer({});

    // reset the map
    $reset_button.click(function (){
        directionsRenderer.setPanel(null);
        directionsRenderer.setMap(null);
        marker_imhere.setVisible(false);
        $search_text.val('');
        $search_results.empty();
        _set_zoom(map, locations);
    });

    // set the search results
    _search_results = function (center){
        var computeDistanceBetween = google.maps.geometry.spherical.computeDistanceBetween,
            visible_locations, $i_am_here, bound;

        directionsRenderer.setPanel(null);
        directionsRenderer.setMap(null);
        marker_imhere.setVisible(true);
        marker_imhere.setPosition(center);

        visible_locations = $.grep(locations, function (item){
            return item.marker.getVisible();
        });

        $.each(visible_locations,function (){
            this.distance_from_center = computeDistanceBetween(center,this.marker.getPosition());
        });

        visible_locations.sort(function (a,b){
            if (a.distance_from_center > b.distance_from_center){
                return 1;
            }
            else {
                return -1;
            }
        });

        $search_results.empty();

        $i_am_here = $([
'<div class="googleMapIMHere">',
'<div><h4><img src="' + marker_imhere.icon.url + '"/> ' + w.mapsConfig.i18n.label_nearestplaces + '</h4>',
'</div>',
'</div>'].join('')).appendTo($search_results);

        bound = new google.maps.LatLngBounds();

        $.each(visible_locations.slice(0,5), function (){
            var $result, thislocation = this;
            bound.extend(thislocation.marker.getPosition());
            $result = $([
'<div class="googleMapResult">',
'<div>',
'<img src="' + thislocation.marker.icon.url + '"/><a href="' + thislocation.link + '">' + thislocation.title + '</a>',
'</div>',
'<div class="indication">' + w.mapsConfig.i18n.label_directions + ' &raquo;&nbsp;</div>',
'</div>'].join('')).appendTo($search_results);
            $result
            .find('.indication')
            .click(function (){
                 var dservice = new google.maps.DirectionsService();
                 var directionRequest = {origin: center,
                                         destination:thislocation.marker.getPosition(),
                                         travelMode: google.maps.TravelMode.DRIVING};

                 $(this).closest('.googleMapResult').addClass('selected').siblings().removeClass('selected');

                 dservice.route(directionRequest, function (directionResult, directionStatus){
                     if(directionStatus !== google.maps.DirectionsStatus.OK){
                         return ;
                     }
                     directionsRenderer.setDirections(directionResult);
                     directionsRenderer.setPanel($directions.get(0));
                     directionsRenderer.setMap(map);
                 });
            });
            $result
            .find('img')
            .click(function (){
                thislocation.info_window.open(map, thislocation.marker);
            });
        });
        bound.extend(center);
        map.fitBounds(bound);

        $i_am_here.click(function (){
            directionsRenderer.setPanel(null);
            directionsRenderer.setMap(null);
            map.fitBounds(bound);
            $(this).closest('.googleMapSearchResults').find('.googleMapResult').removeClass('selected');
        });

    };
    // set the search results (end)

    // open/close the search bar
    $search.find('.googleMapSearchBar').click(function (){
        var $this = $(this),
            $googleMapSearch = $this.next();
        if ($this.is('.open')){
            $googleMapSearch.animate({'margin-left':'-180px'}, 'fast',  function(){
                $this.toggleClass('open');
            });
        }
        else {
            // try to guess the user position if the input is empty
            if (! $search_text.val().length){
                if (navigator.geolocation){
                    navigator.geolocation.getCurrentPosition(function(position) {
                        var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                        _reverseGeocoding(pos, $search_text);
                         _search_results(pos);
                    });
                }
            }
            $googleMapSearch.animate({'margin-left':'0px'}, 'fast',  function(){
                $this.toggleClass('open').next().hide().show(); // this is a hack for IE7
            });
        }
    });

    // setting up the geocoder
    _setupGeocoder($search_text, $search_button,_search_results);

};


var initViewMap = function (){
    var $this = $(this).addClass('googleMapActive'),
        $map_node = $('<div class="googleMapPane" />').appendTo($this),
        $savelayout = $('#maps-save-layout'),
        map_options, map, locations, layers;

    $this.find('ul').hide();

    /*
        generate marker icons as google.maps.MarkerImage
    */

    _all_icons = (function (){
        var out = {},
            Point = google.maps.Point,
            Size = google.maps.Size;

        $.each(w.mapsConfig.markericons, function (){
            var icon = new google.maps.MarkerImage(this.icon, //url
                                                   new Size(parseInt(this.iconSize[0], 10), parseInt(this.iconSize[1], 10)), //size
                                                   null,
                                                   new Point(parseInt(this.iconAnchor[0], 10), parseInt(this.iconAnchor[1], 10))); //origin

            out[this.name] = icon;
        });

        return out;
    }());

    /*
        generate marker icons shadows as google.maps.MarkerImage
    */

    _all_shadows = (function (){
        var out = {},
            Point = google.maps.Point,
            Size = google.maps.Size;
        $.each(w.mapsConfig.markericons, function (){

            var icon = new google.maps.MarkerImage(this.shadow, //url
                                                   new Size(parseInt(this.shadowSize[0], 10), parseInt(this.shadowSize[1], 10)), //size
                                                   null,
                                                   new Point(parseInt(this.iconAnchor[0], 10), parseInt(this.iconAnchor[1], 10))); //origin

            out[this.name] = icon;
        });
        return out;
    }());

    /*
        initializing map, locations, layers
    */

    map_options = {
        mapTypeId: w.mapsConfig.settings.maptype || google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map($map_node.get(0), map_options);
    w.activeMaps.push(map);

    locations = _createLocations($this, map);
    layers = _getLayersList(locations);

    _set_zoom(map, locations);

    // manage layers
    if (w.mapsConfig.layers_active.toLowerCase() === 'true' && layers.length && locations.length > 1){
        _addLayerControl(layers, map, locations);
    }

    // save settings

    if($savelayout.length){

        $('<input type="button" value="' + w.mapsConfig.i18n.label_deletemapsettings +'"/>')
        .click(function (){
            var url = w.mapsConfig.context_url + '/@@maps_save_config';

            $.post( url, {}, function (){
                $('#kssPortalMessage').show();
                $('#kssPortalMessage dd').text(w.mapsConfig.i18n.label_updatedmapsettings);
                w.location = w.location;
            });
        })
        .appendTo($savelayout);

        $('<input type="button" value="' + w.mapsConfig.i18n.label_savemapsettings +'"/>')
        .click(function (){
            var center = map.getCenter(),
                url = w.mapsConfig.context_url + '/@@maps_save_config';

            w.mapsConfig.settings.maptype = map.getMapTypeId();
            w.mapsConfig.settings.center = [center.lat(), center.lng()];
            w.mapsConfig.settings.zoom = map.getZoom();

            $.post( url, w.mapsConfig.settings, function (){
                $('#kssPortalMessage').show();
                $('#kssPortalMessage dd').text(w.mapsConfig.i18n.label_updatedmapsettings);
            });
        })
        .appendTo($savelayout);
    }

    // search doesn't make sense with only one location
    if (w.mapsConfig.search_active.toLowerCase() === 'true' && locations.length > 1){
        _searchForm($this, locations, map, new google.maps.Marker({
            icon: _all_icons['_yah'],
            shadow:_all_shadows['_yah'],
            map: map,
            visible:false
        }));
    }


};

/*
A single edit map (based on this DOM node)
*/


var initEditMap = function (){
    var $this = $(this).addClass('googleMapActive'),
        $input = $this.find("input"),
        map, $location, $map_node,
        map_width, map_height, map_options,
        center, marker, $search_button, $search_text;

    var _update_position = function (){
        var pos = marker.getPosition();
        $location.text(pos.lat() + ', ' + pos.lng());
        $input.eq(0).val(pos.lat());
        $input.eq(1).val(pos.lng());
        map.setCenter(pos);
        _reverseGeocoding(pos, $search_text);
    };

    if ($input.length !== 2){
        return;
    }

    $location = $('<div class="locationString discreet" />');

    $map_node = $('<div class="googleMapPane" />');
    $this.append($map_node).append($location);

    map_width = $this.width();
    map_height = $this.height();
    map_options = {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 16
    };
    map = new google.maps.Map($map_node.get(0), map_options);
    w.activeMaps.push(map);

    center = new google.maps.LatLng(parseFloat($input.eq(0).val()),
                                    parseFloat($input.eq(1).val()));

    marker = new google.maps.Marker({draggable: true, position: center, map: map});

    google.maps.event.addListener(map, 'click', function (evt){
        marker.setPosition(evt.latLng);
        _update_position();
    });

    google.maps.event.addListener(marker, 'dragend', function (evt){
        _update_position();
    });

    // setting up geocoding
    $search_button = $('<input type="button" value="' + w.mapsConfig.i18n.label_search + '" class="searchButton" />').prependTo($this);
    $search_text = $('<input type="text" class="mapSearchBar" />').prependTo($this);

    _setupGeocoder($search_text, $search_button, function (latLng){
        marker.setPosition(latLng);
        _update_position();
    });
    $input.hide();

    _update_position();

};


/*
load gmap and launch initialize_maps
*/
var _loadgmap = function(){
    var source,
        script = document.createElement("script");

    script.type = "text/javascript";
    source = "https://maps.google.com/maps/api/js?libraries=geometry&sensor=false&callback=initialize_maps&language=" + w.mapsConfig.i18n.language ;
    if (w.mapsConfig.googlemaps_keys.length){
        source += '&key=' + w.mapsConfig.googlemaps_keys;
    }
    script.src = source;

    document.body.appendChild(script);
};

/*
map: view mode
*/
$.fn.productsMapView = function (){

    if (!this.length){
        return this;
    }

    w.initialize_maps = (function ($node){
        return function (){
            $node.each(initViewMap);
        };
    }(this));

    _loadgmap();
    return this;
};

/*
map: edit mode
*/
$.fn.productsMapEdit = function (){

    if (!this.length){
        return this;
    }

    w.initialize_maps = (function ($node){
        return function (){
            $node.each(initEditMap);
        };
    }(this));

    _loadgmap();
    return this;
};

// start!
$(document).ready(function() {
    w.activeMaps = [];
    $('.googleMapView').productsMapView();
    $('.googleMapEdit').productsMapEdit();
});

}(jQuery, window));


