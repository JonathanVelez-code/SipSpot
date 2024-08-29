mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/outdoors-v12', // stylesheet location
    center: coffeeshop.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
    zoom: 14 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(coffeeshop.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h3>${coffeeshop.title}</h3><p>${coffeeshop.location}</p>`
            )
    )
    .addTo(map)