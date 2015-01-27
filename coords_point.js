/* Copyright Art. Lebedev | http://www.artlebedev.ru */
/* Created 2014-01-20 by Rie (Iblyaminov Albert) */
/* Updated 2014-08-18 by dryzhov (Ryzhov Dmitry) */

define('coords_point', ['jquery', 'als'], function ($, als) {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var toolbar = document.getElementById('toolbar'),
        iframe = toolbar && toolbar.firstElementChild;
    if (iframe && /beeline/.test(iframe.getAttribute('src'))) {
        toolbar.parentNode.removeChild(toolbar);
    }
  });
  setTimeout(function() {
    var script = document.querySelector('script[name=ets-anchor]');
    if (script) {
        script.parentNode.removeChild(script);
    }
  }, 0);

  /**
   * Yandex map with placemarks
   * by default being positioned at the center of Moscow
   *
   * @param {Object} options
   * @param {jQuery} options.root
   * @param {Array} [options.coords]
   * @param {Array} [options.map_center]
   * @param {Array} [options.placemarks]
   * @constructor
   */
function Map (root) {  // !!!!
    var defaults = {
      coords: [{ lat: 54.3135, lng:37.7420 }],
      map_center: [37.7420, 54.3135],
      placemarks: []
    };

    $.extend(this, defaults, {}); // !!!!
    this.root = root;  // !!!!

    this.loadMap(
      $.proxy(this.createMap, this),
      $.proxy(this.init, this)
    );
  }

  /**
   * Загрузка карты
   */
  Map.prototype.loadMap = function () {
    var yMaps = $.Deferred();
    window.yandexMapsLoaded = function () {
      yMaps.resolve();
    };
    yMaps.done(arguments);
    require(['//api-maps.yandex.ru/2.0.39/?load=package.full&lang=ru-RU&onload=yandexMapsLoaded']);
    require(['//yandex.st/jquery/2.1.1/jquery.min.js']);
  };

  Map.prototype.createMap = function () {
    var myPlacemark, coor, coor_1, myCollection, prev;
    var distance = 0;
    var distance1 = 0;
    var i,
      el = this.root.get(0);

    this.yMap = new ymaps.Map(
      el,
      {
        center: [54.3135, 37.7420],
        zoom: 7,
        type: 'yandex#map',
        controls: ["zoomControl"]
      },{
        balloonMaxWidth: 200
    }
    ),
    ymapsmlButton = $('.load-ymapsml'),
    ymapsmlButton1 = $('.load-ymapsml1');

    // Отключение кеширования атрибута disabled в Firefox.
    ymapsmlButton.get(0).disabled = false;
    ymapsmlButton1.get(0).disabled = false;

    // Сохраняем значение this.yMap в переменнную myMap.
    var myMap = this.yMap;

    // Добавляем метки аэропортов на карту, по клику на кнопку "Показать аэропорты"
    ymapsmlButton.click(function () {
    /*
    // Создание GeoQueryResult из JSON.
    var result = ymaps.geoQuery({
        type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [55.617222, 38.059999]
                 },
                 "properties": {
                 "balloonContent": "Международный аэропорт Быково",
                 "hintContent": "Аэропорт Быково"
                 },
                 "options": {
                 "preset": "twirl#airplaneIcon"
                 }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [55.408786, 37.906314]
                    },
                 "properties": {
                 "balloonContent": "Международный аэропорт Домодедово",
                 "hintContent": "Аэропорт Домодедово"
                 },
                 "options": {
                 "preset": "twirl#airplaneIcon"
                 }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [55.591531, 37.261486]
                    },
                 "properties": {
                 "balloonContent": "Международный аэропорт Внуково",
                 "hintContent": "Аэропорт Внуково"
                 },
                 "options": {
                 "preset": "twirl#airplaneIcon"
                 }
                },
                {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [55.972642, 37.414589]
                    },
                 "properties": {
                 "balloonContent": "Международный аэропорт Шереметьево",
                 "hintContent": "Аэропорт Шереметьево"
                 },
                 "options": {
                 "preset": "twirl#airplaneIcon"
                 }
                }
            ]
      });
// Неточечные объекты добавим на карту как есть.
result.search('geometry.type != "Point"').addToMap(myMap);
// Точечные объекты добавим на карту через кластеризатор.
myMap.geoObjects.add(result.search('geometry.type == "Point"').clusterize());

//удаление объектов(списка аэропортов) с карты
ymapsmlButton1.click(function () {
var result1 = result.remove(result);
myMap.geoObjects.remove(result);
console.log('init object', result1);
});
*/

// Создание GeoQueryResult из массива геообъектов.
    var objects1 = [
        new ymaps.Placemark([55.591531, 37.261486], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Внуково",
                    "hintContent": "Аэропорт Внуково"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
        new ymaps.Placemark([55.617222, 38.059999], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Быково",
                    "hintContent": "Аэропорт Быково"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
        new ymaps.Placemark([55.408786, 37.906314], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Домодедово",
                    "hintContent": "Аэропорт Домодедово"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                }),
        new ymaps.Placemark([55.972642, 37.414589], {
                    // Свойства
                    // Текст метки
                    "balloonContent": "Международный аэропорт Шереметьево",
                    "hintContent": "Аэропорт Шереметьево"
                }, {
                    // Опции
                    // Иконка метки будет растягиваться под ее контент
                    preset: 'twirl#airplaneIcon'
                })
    ];
// добавляем массив с данными аэропортов
ymaps.geoQuery(objects1).addToMap(myMap).setOptions('visible', true);

console.log('init object', objects1);

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

});

    // Подгрузка xml-файла со списком меток.
    /*
    // При нажатии на кнопку загружаем соответствующий XML-файл.
    // и отображаем его данные на карте.
    ymapsmlButton.click(function (e) {
        ymaps.geoXml.load('http://maps.yandex.ru/export/usermaps/93jfWjoXws37exPmKH-OFIuj3IQduHal/')
            .then(onGeoXmlLoad);
        e.target.disabled = true;
        var load = ymaps.geoXml.load('http://maps.yandex.ru/export/usermaps/93jfWjoXws37exPmKH-OFIuj3IQduHal/');
        console.log('init object', load);
    });

    // Обработчик загрузки XML-файлов.
    function onGeoXmlLoad (res) {
        myMap.geoObjects.add(res.geoObjects);
        if (res.mapState) {
            res.mapState.applyToMap(myMap);
        }
    }
    */

    // Создание GeoQueryResult из файла data.js.
    //$.getScript("http://intranet.russiancarbon.org/f/min/blocks/data.js");

    //ДОБАВЛЯЕМ ДРАГГЕР К КАРТЕ. Перетаскиваемую метку, находящуюся под блоком с картой.
    var markerElement = $('#marker');

    //var markerElement = Ext.select('#marker #marker_1');

    var dragger = new ymaps.util.Dragger({
            // Драггер будет автоматически запускаться при нажатии на элемент 'marker'.
            autoStartElement: markerElement[0]
    });

    // Смещение маркера относительно курсора.
    var markerOffset, markerPosition;

    dragger.events
        .add('start', onDraggerStart)
        .add('move', onDraggerMove)
        .add('stop', onDraggerEnd);

    function onDraggerStart(event) {
        var offset = markerElement.offset(),
            position = event.get('position');
            //markerElement.offset({top:1049, left:0});
            //markerElement.html( "left: " + offset.left + ", top: " + offset.top );
            //position[0] = 0;
            //position[0] = 0;
            console.log('init object', offset);
            console.log('init object', position);
        // Сохраняем смещение маркера относительно точки начала драга.
        markerOffset = [
            position[0] - offset.left,
            position[1] - offset.top
        ];
        markerPosition = [
            position[0] - markerOffset[0],
            position[1] - markerOffset[1]
        ];
        console.log('init object', markerPosition);

        applyMarkerPosition();
    }

    function onDraggerMove(event) {
        applyDelta(event);
    }

    function onDraggerEnd(event) {
        applyDelta(event);
        markerPosition[0] += markerOffset[0];
        markerPosition[1] += markerOffset[1];
        // Переводим координаты страницы в глобальные пиксельные координаты.
        var markerGlobalPosition = myMap.converter.pageToGlobal(markerPosition),
            // Получаем центр карты в глобальных пиксельных координатах.
            mapGlobalPixelCenter = myMap.getGlobalPixelCenter(),
            // Получением размер контейнера карты на странице.
            mapContainerSize = myMap.container.getSize(),
            mapContainerHalfSize = [mapContainerSize[0] / 2, mapContainerSize[1] / 2],
            // Вычисляем границы карты в глобальных пиксельных координатах.
            mapGlobalPixelBounds = [
                [mapGlobalPixelCenter[0] - mapContainerHalfSize[0], mapGlobalPixelCenter[1] - mapContainerHalfSize[1]],
                [mapGlobalPixelCenter[0] + mapContainerHalfSize[0], mapGlobalPixelCenter[1] + mapContainerHalfSize[1]]
            ];
        // Проверяем, что завершение работы драггера произошло в видимой области карты.
        if (containsPoint(mapGlobalPixelBounds, markerGlobalPosition)) {
            // Теперь переводим глобальные пиксельные координаты в геокоординаты с учетом текущего уровня масштабирования карты.
            var geoPosition = myMap.options.get('projection').fromGlobalPixels(markerGlobalPosition, myMap.getZoom());
            alert(geoPosition.join(' '));
        }
    }

    function applyDelta (event) {
        // Поле 'delta' содержит разницу между положениями текущего и предыдущего события драггера.
        var delta = event.get('delta');
        markerPosition[0] += delta[0];
        markerPosition[1] += delta[1];
        applyMarkerPosition();
    }

    function applyMarkerPosition () {
        markerElement.css({
            left: markerPosition[0],
            top: markerPosition[1]
        });
    }

    function containsPoint (bounds, point) {
        return point[0] >= bounds[0][0] && point[0] <= bounds[1][0] &&
               point[1] >= bounds[0][1] && point[1] <= bounds[1][1];
    }

    //Определяем элемент управления поиск адреса по карте
	var SearchControl = new ymaps.control.SearchControl({noPlacemark:true});

    //Добавляем элементы управления на карту
	this.yMap.controls
	    .add(SearchControl)
        .add('zoomControl')
        .add('typeSelector')
        .add('mapTools')
        .add('smallZoomControl');

    this.yMap.behaviors.disable(['scrollZoom', 'rightMouseButtonMagnifier']);

    //Общая начальная точка метки. Откуда начинаем считать расстояние(getDistance()) в трех обработчиках событий(перетаскивания, клика по карте, поиска по карте).
    coor = [55.752078, 37.621147];
    //Начальные координаты точки, если не было произведено никаких действий по карте. Нужны для функции savecoordinats().
    coor_1 = [55.752078, 37.621147];

	//Определяем метку и добавляем ее на карту
	myPlacemark = new ymaps.Placemark(coor, {}, {preset: "islands#violetDotIcon", draggable: true, visible: true});
    this.yMap.geoObjects.add(myPlacemark);

    //Отслеживаем событие начала перемещения метки
     myPlacemark.events.add("dragstart", function (e) {
     //Начальная точка при перемещении метки. Откуда начинаем считать расстояние
     prev = this.geometry.getCoordinates();
    }, myPlacemark);

    //Отслеживаем событие перемещения метки
    myPlacemark.events.add("drag", function (e) {
     /*
     alert(ymaps.formatter.distance(
       ymaps.coordSystem.geo.getDistance(prev, current)
     ));
     */
     //console.log('init object', distance);
    }, myPlacemark);

    //Отслеживаем событие завершения перемещения метки
	myPlacemark.events.add("dragend", function (e) {

    var current = this.geometry.getCoordinates();
    //Конечная точка метки при перемещении. Где заканчивааем считать расстояние
    coor_1 = this.geometry.getCoordinates();
    // Пройденное расстояние
    distance = Math.round(ymaps.coordSystem.geo.getDistance(prev, current) / 1000);
	savecoordinats();
    // Отправим запрос на геокодирование. Геокодирование координат полученной метки, в полный адрес. Его вывод в балуне метки.
       ymaps.geocode(coor_1).then(function (res) {
         var firstGeoObject = res.geoObjects.get(0);

         myMap.balloon.open(coor_1, {
         contentHeader:'Адрес метки:',
         contentBody:'<p><small>' + firstGeoObject.properties.get('text') + '</small></p>'
         });
    });
	}, myPlacemark);

    //Отслеживаем событие щелчка по карте
	this.yMap.events.add('click', function (e) {
    //Конечная точка метки при клике по карте. Где заканчивааем считать расстояние
    coor_1 = e.get('coordPosition');
    // Пройденное расстояние
    distance = Math.round(ymaps.coordSystem.geo.getDistance(coor, coor_1) / 1000);
	savecoordinats();

    // Отправим запрос на геокодирование. Геокодирование координат полученной метки, в полный адрес. Его вывод в балуне метки.
       ymaps.geocode(coor_1).then(function (res) {
       var firstGeoObject = res.geoObjects.get(0);

         myMap.balloon.open(coor_1, {
         contentHeader:'Адрес метки:',
         contentBody:'<p><small>' + firstGeoObject.properties.get('text') + '</small></p>'
         //contentFooter:'<sup>Щелкните еще раз</sup>'
         });
             /*
            myPlacemark.properties
                .set({
                    iconContent: firstGeoObject.properties.get('name'),
                    balloonContent: firstGeoObject.properties.get('text')
                });

       var names = [];
         // Переберём все найденные результаты и
         // запишем имена найденный объектов в массив names.
         res.geoObjects.each(function (obj) {
            names.push(obj.properties.get('name'));
         });

         myMap.balloon.open(coor_1, {
         contentHeader:'Адрес метки:',
         contentBody:'<p><small>' + names.reverse().join(', ') + '</small></p>'
         //contentFooter:'<sup>Щелкните еще раз</sup>'
         });
         */

                /*
                // Добавим на карту метку в точку, по координатам
                // которой запрашивали обратное геокодирование.
                myMap.geoObjects.add(new ymaps.Placemark(coor_1, {
                    // В качестве контента иконки выведем
                    // первый найденный объект.
                    iconContent:names[0],
                    // А в качестве контента балуна - подробности:
                    // имена всех остальных найденных объектов.
                    hintContent:names.reverse().join(', ')
                }, {
                    preset:'twirl#lightblueStretchyIcon'
                }));
                */
    });

	});

	//Отслеживаем событие выбора результата поиска
	SearchControl.events.add("resultselect", function (e) {
    //Конечная точка метки при поиске по карте. Где заканчивааем считать расстояние
    coor_1 = SearchControl.getResultsArray()[0].geometry.getCoordinates();
    // Пройденное расстояние
    distance = Math.round(ymaps.coordSystem.geo.getDistance(coor, coor_1) / 1000);
	savecoordinats();
    // Отправим запрос на геокодирование. Геокодирование координат полученной метки, в полный адрес. Его вывод в балуне метки.
       ymaps.geocode(coor_1).then(function (res) {
         var firstGeoObject = res.geoObjects.get(0);

         myMap.balloon.open(coor_1, {
         contentHeader:'Адрес метки:',
         contentBody:'<p><small>' + firstGeoObject.properties.get('text') + '</small></p>'
         });
    });
	});

    //Ослеживаем событие изменения области просмотра карты - масштаб и центр карты
	this.yMap.events.add('boundschange', function (event) {
    if (event.get('newZoom') != event.get('oldZoom')) {
        savecoordinats();
    }
	  if (event.get('newCenter') != event.get('oldCenter')) {
        savecoordinats();
    }

	});

    //Функция для передачи полученных значений в форму
	function savecoordinats (){
		var new_coords = [coor_1[0].toFixed(4), coor_1[1].toFixed(4)];
		myPlacemark.getOverlay().getData().geometry.setCoordinates(new_coords);
		document.getElementById("latlongmet").value = new_coords;
		document.getElementById("mapzoom").value = myMap.getZoom();
		var center = myMap.getCenter();
		var new_center = [center[0].toFixed(4), center[1].toFixed(4)];
		document.getElementById("latlongcenter").value = new_center;
        document.getElementById("distance").value = distance;
	}

    /*
    //определение местоположениея пользователя
    this.yMap.geoObjects.add(
    new ymaps.Placemark(
        [ymaps.geolocation.latitude, ymaps.geolocation.longitude],
        {
            balloonContentHeader: ymaps.geolocation.country,
            balloonContent: ymaps.geolocation.city,
            balloonContentFooter: ymaps.geolocation.region
        }
    )
    );
    */

    /*
    // получение координатной системы
    var coordSystem = this.yMap.options.get('projection').getCoordSystem();

    var minDist = coordSystem.getDistance(givenPoint, points[0]);

    $(".route-length3").append('Пробег: <strong>' + minDist + '<strong> км<br />');
    */

    this.yMap.setBounds(this.yMap.geoObjects.getBounds());

    if (this.yMap.getZoom() >= 7) {
      this.yMap.setZoom(7);
    }
  };



  Map.prototype.init = function () {
    this.root.addClass('ymap-ready');
  };

  als.Map = Map;
  return Map;
});