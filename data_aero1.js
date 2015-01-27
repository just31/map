var objects1 = [];

objects1 = [
        new ymaps.Placemark([55.591531, 37.261486], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Внуково"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
        new ymaps.Placemark([55.617222, 38.059999], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Быково"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
        new ymaps.Placemark([55.408786, 37.906314], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Домодедово"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
        new ymaps.Placemark([55.972642, 37.414589], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Шереметьево"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
       new ymaps.Placemark([55.503814, 37.512229], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Остафьево"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
       new ymaps.Placemark([59.800935, 30.260267], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Пулково"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
       new ymaps.Placemark([56.1330, 40.4088], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Семязино"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                })
    ];

/*
//console.log('init object', closestObject);

var coord_aero = [];
var markers_aero = [];
coord_aero = closestObject.geometry.getCoordinates();


console.log('init object', coord_aero);

var point_1_aero = coord_aero[0]; // широта ближайшей точки.
var point_2_aero = coord_aero[1]; // долгота ближайшей точки.

var distance_aero_1 =+ Math.round(ymaps.coordSystem.geo.getDistance(coordinates, coord_aero) / 1000);

$(".route-length1").append('<br />От выбранной точки до ближайшего аэропорта: <strong>' + distance_aero_1 + ' км</strong><br />');
//$(".route-length1").append('<h3>Сумма: <strong>' + distance_aero_1 + ' км</strong></h3>');

var closestObject_1 = arPlacemarksRez.getClosestTo(coordinates).balloon.open();
*/

/*
var placemark_1 = new ymaps.Placemark(coord_aero, {}, {draggable: true, visible: true});
placemark_1.options.set('iconImageHref', 'http://intranet.russiancarbon.org/f/min/images/airplane.png');
placemark_1.options.set('iconImageSize', [35, 34]);
myMap.geoObjects.add(placemark_1);
*/

/*
ymaps.route([
   coordinates,  //от найденной точки аэропорта
   coord_aero
],       //до перетянутой на карту точки
{
   // Опции маршрутизатора
   avoidTrafficJams: true, // строить маршрут с учетом пробок
   mapStateAutoApply: false, // автоматически позиционировать карту
   visible: false
}).then(function (route) {
myMap.geoObjects.add(route);
var points = route.getWayPoints();
points.options.set('iconImageHref', 'http://intranet.russiancarbon.org/f/min/images/airplane.png');
 //пишем дистанцию на метке
 var distance = Math.round(route.getLength()/1000);
 $(".route-length1").append('<h3>Общая длина маршрута от выбранной точки до ближайшего аэропорта: <strong>' + distance + ' км</strong></h3>');
 //points.properties.set({iconContent: distance});
});
console.log('init object', distance);
*/


/*
//удаление объектов(списка аэропортов) с карты
ymapsmlButton1.click(function () {

    //запрос на получение списка объектов из массива objects1
    var result = ymaps.geoQuery(objects1);
    // удаление объектов из результата запроса. Обнуление массива objects1
    var result1 = result.remove([objects1[0], objects1[1], objects1[2], objects1[3]]);
    // удаление объектов с карты
    var result2 = result.removeFromMap(myMap);

    console.log('init object', result2);
    //проверка что переменная result существует, перед ее удалением
    //result && result.remove(objects);

});
*/