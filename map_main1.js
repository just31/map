/* Copyright Art. Lebedev | http://www.artlebedev.ru */
/* Created 2014-01-20 by Rie (Iblyaminov Albert) */
/* Updated 2014-08-18 by dryzhov (Ryzhov Dmitry) */

define('map_main1', ['jquery', 'als'], function ($, als) {
  'use strict';

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
      coords: [{ lat: 55.752078, lng:37.621147 }],
      map_center: [37.621147, 55.752198],
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
    require(['//api-maps.yandex.ru/2.1.22/?load=package.full&lang=ru-RU&onload=yandexMapsLoaded']);
    require(['//yandex.st/jquery/2.1.1/jquery.min.js']);
    require(['http://dimik.github.io/ymaps/examples/migration/1.x-2.0/user-layer/tiler-converter.js']);
  };

Map.prototype.createMap = function () {
    
// Если данные отправляются от формы методом POST. Обрабатываем их, проверяем и выводим: либо текст об успешной отправке, либо текст с предупреждением. На дозаполнение обязательных полей.
// Тексты выводятся в модальных окнах.
// Данный метод отправки полей формы, лучше использовать, если предполагается пересылка вложенных файлов, в сообщении.
var name = $("#name").val();
var threes = $("#threes").val();
var email = $("#email").val();
var address = $("#address").val();

if(name !== '' && threes !== '' && email !== '' && address !== '')
{
  $(".main").append('<div id="myModalBox_send" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" style="color: #594540 !important;"><h5 class="modal-title">Ваш заказ успешно отправлен!</h5>Ждем Вас снова!' +
  '</div><div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal" id="close_zakaz">Закрыть</button></div></div></div></div>');
  $("#myModalBox_send").modal('show');

  // После сообщения об успешной отправке, делаем reload странице, по нажатию на кнопку "Закрыть" модального окна. Чтобы данные формы не отправились дважды.
  $("#close_zakaz").on("click", function(){
    window.location.href = "/posadit-les/";
  });
}

// Проверяем клик по кнопке в форме заказа. Если клик произошел, проверяем на заполненность обязательных полей. Если какие либо из них не были заполнены, выводим предупреждающий текст.
$("#send").on("click", function(){

var name = $("#name").val();

if(name === '' && threes === '' && email === '' && address === ''){
  $(".main").append('<div id="myModalBox_senderr" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" style="color: #594540 !important;"><h5 class="modal-title">Заполните пожалуйста все обязательные поля.</h5>Помечены символом звездочки *</div><div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal">Закрыть</button></div></div></div></div>');
  $("#myModalBox_senderr").modal('show');
  // Делаем return false кнопке в форме заказа, чтобы оставить форму открытой. Для дозаполнения не достающих полей.
  return false;
}
});

// Если для отправления полей формы заказа, используется метод GET. То обработку и вывод сообщений делаем по другому.
// Данный метод отправки полей формы, лучше использовать, если пересылка вложенных файлов, в сообщении не предполагается. Также в нем дополнительно, можно выводить даннве по заказу. В модальном окне сообщения об успешной отправке.
// Получаем строку get-запроса с переменными от формы, из url. Декодируем ее, чтобы русский текст выводился правильно.
var p_url=decodeURIComponent(location.search).substring(1);

// Если строка не пустая, обрабатываем переменные. Получая только значения, из пары ключ-значение.
if(p_url !== '') {

// Режем строку запроса, по символу &, кладем ее в массив parametr.
var parametr=p_url.split("&");

var threes_zakaz = parametr[0].split("threes=");
var threes_zakaz1 = threes_zakaz[1];
console.log("Кол-во саженцев:", threes_zakaz1);

var name_zakaz = parametr[1].split("name=");
var name_zakaz1 = name_zakaz[1];
console.log("Имя заказчика:", name_zakaz1);

var email_zakaz = parametr[2].split("email=");
var email_zakaz1 = email_zakaz[1];
console.log("Email заказчика:", email_zakaz1);

var address_zakaz = parametr[3].split("address=");
var address_zakaz1 = address_zakaz[1];
console.log("Адрес доставки саженцев:", address_zakaz1);

var phone_zakaz = parametr[4].split("phone=");
var phone_zakaz1 = phone_zakaz[1];
console.log("Телефон заказчика:", phone_zakaz1);

//Если все обязательные поля формы были заполнены, пишем в модальном окне текст об успешном отправлении заказа. И обновляем страницу по кнопке Закрыть.
if(threes_zakaz1 !== '' && name_zakaz1 !== '' && email_zakaz1 !== '' && address_zakaz1 !== ''){

/*
$.get('http://intranet.russiancarbon.org/data/processes/message.p', {name_zakaz:name_zakaz}, function(data){
	alert('Сервер ответил: '+data);
});
*/

$(".main").append('<div id="myModalBox_send" class="modal fade"><div class="modal-dialog"><div class="modal-content"><div class="modal-header" style="color: #594540 !important;"><h5 class="modal-title">Ваш заказ успешно отправлен!</h5>Ждем Вас снова!' +
'<hr />' +
'<div style="text-align: left; margin-top: -10px;"><h3><i style="color: #0088CB; font-size: 16px;">Данные по заказу:</i></h3><small><b style="color: #5cb85c;">Кол-во саженцев:</b> <b style="color: #99490E;">' + threes_zakaz1 + '</b><br />' +
'<b style="color: #5cb85c;">Имя заказчика:</b> <b style="color: #99490E;">' + name_zakaz1 + '</b><br />' +
'<b style="color: #5cb85c;">Email заказчика:</b> <b style="color: #99490E;">' + email_zakaz1 + '</b><br />' +
'<b style="color: #5cb85c;">Адрес доставки саженцев:</b> <b style="color: #99490E;">' + address_zakaz1 + '</b><br />' +
'<b style="color: #5cb85c;">Телефон заказчика:</b> <b style="color: #99490E;">' + phone_zakaz1 + '</b></small></div>' +
'</div><div class="modal-footer"><button type="button" class="btn btn-primary" data-dismiss="modal" id="close_zakaz">Закрыть</button></div></div></div></div>');
$("#myModalBox_send").modal('show');

$("#close_zakaz").on("click", function(){
  window.location.href = "/posadit-les/";
});
}
//Если не все обязат. поля были заполнены, выводим предупреждающий текст. И выводим в модальном окне форму для заполнения заказа заново.
else{
$(".main").append('<div id="myModal" class="modal fade"><div class="modal-dialog"><div class="modal-content">' +
'<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3><i style="color: #8B0000; font-size: 20px;">Заполните пожалуйста все необходимые поля формы.</i></h3><h4 class="modal-title" id="myModalLabel" style="color: #594540 !important;">Оформление заказа на посадку леса</h4></div>' +
'<div class="modal-body" style="color: #696969 !important;"><form id="contact" name="contact" action="/posadit-les/" method="get" enctype="multipart/form-data">' +
'<div class="control-group"><label class="control-label" for="threes" style="font-size: 14px; color: #6B8E23;">Укажите кол-во саженцев <b style="color: red;">*</b></label><div class="controls"><input id="threes" name="threes" type="text" placeholder="5" class="input-xlarge"></div></div><br />' +
'<div class="control-group"><label class="control-label" for="name" style="font-size: 12px; color: #6B8E23;">Ваше имя <b style="color: red;">*</b></label><div class="controls"><input id="name" name="name" type="text" placeholder="" class="input-xlarge"></div></div>' +
'<div class="control-group" style="margin-top: 5px;"><label class="control-label" for="email" style="font-size: 12px; color: #6B8E23;">Контактный email <b style="color: red;">*</b></label><div class="controls"><input id="email" name="email" type="text" placeholder="email" class="input-xlarge"></div></div>' +
'<div class="control-group" style="margin-top: 5px;"><label class="control-label" for="address" style="font-size: 12px; color: #6B8E23;">Адрес доставки саженцев <b style="color: red;">*</b></label><div class="controls"><input id="address" name="address" type="text" placeholder="" class="input-xlarge"></div></div>' +
'<div class="control-group" style="margin-top: 5px;"><label class="control-label" for="phone" style="font-size: 12px; color: #6B8E23;">Ваш телефон</label><div class="controls"><input id="phone" name="phone" type="text" placeholder="(+7)" class="input-xlarge"></div></div>' +
//'<div class="control-group" style="margin-top: 5px;"><label class="control-label" for="singlebutton-0"></label><div class="controls"><button id="send" name="send" value class="btn btn-success">Отправить</button></div></div>' +
'<br /><input class="btn btn-success" id="send" type="submit" value="Оформить заказ">' +
//'<input type="hidden" name="send_zakaz" value="send_zakaz">' +
'</form></div>');
$("#myModal").modal('show');
}

}

// Обработка значений полученных из формы методом Get.
/*
var values_zakaz = [];
var j;
for(var i in parametr) {
    j=parametr[i].split("=");
    values_zakaz[j[0]]=unescape(j[1]);
    //console.log(j);
    //console.log(values_zakaz);
}

var tmp = [];		// два вспомагательных
var tmp2 = [];		// массива
var param = [];

var get = decodeURIComponent(location.search);	// строка GET запроса
if(get !== '') {
	tmp = (get.substr(1)).split('&');	// разделяем переменные
	for(var i=0; i < tmp.length; i++) {
		tmp2 = tmp[i].split('=');		// массив param будет содержать
		param[tmp2[0]] = tmp2[1];		// пары ключ(имя переменной)-значение
	}
	var obj = document.getElementById('greq');	// вывод на экран
	for (var key in param) {
		obj.innerHTML += key+" = "+param[key]+"<br>";
	}
}
*/

    // Данные о местоположении пользователя, определённом по IP.
    var geolocation = ymaps.geolocation;
    // Координаты местопложения пользователя. По ним будем открывать центр карты.
    var coords_location = [geolocation.latitude, geolocation.longitude];
    // Результат смотрим в консоли
    //console.log(geolocation.country, geolocation.city, geolocation.region, coords_location);

    //Получаем значения высоты и ширины экрана монитора.
    var heightR = $(window).height();// высота экрана
    // Делаем отступ:
    var heightR_1 = heightR - 78;
    // Делаем отступ:
    var widthR = $(window).width();// ширина экрана
    var widthR_1 = widthR - 25;

    // Устанавливаем полученные значения, в качестве размеров для блока с картой.
    $('#map_main1').css({'width':widthR_1,'height':heightR_1});

    this.yMap = new ymaps.Map("map_main1", {
            center: [55.751574, 37.573856],
            zoom: 10,
            type: 'yandex#hybrid',
            controls: ['zoomControl']
        }),
        counter = 0;

    // Сделаем запрос на геокодирование, а затем спозиционируем карту, чтобы
    // все объекты попадали в видимую область карты и коэффициент масштабирования был
    // максимально возможным.

    //var result = ymaps.geoQuery(ymaps.geocode('Арбат')).applyBoundsToMap(myMap, {checkZoomRange: true});
    // Откластеризуем полученные объекты и добавим кластеризатор на карту.
    // Обратите внимание, что кластеризатор будет создан сразу, а объекты добавлены в него
    // только после того, как будет получен ответ от сервера.
    //myMap.geoObjects.add(result.clusterize());


        // Создание макетов содержимого балунов. По каждой из успешных акций Фонда.

        // Макет создается с помощью фабрики макетов с помощью текстового шаблона. Макет балуна акции с компанией Алкоа.
        BalloonContentLayout = ymaps.templateLayoutFactory.createClass(
            '<div style="margin: 10px;">' +
              '<p style="background-color: rgba(0, 136, 203, 1) !important; padding: 5px; color: #ffffff;"><b style="font-size: 14px;">Акция с компанией Алкоа</b><br /><i style="font-size: 12px;">25 октября 2014 года | Alcoa Foundation</i></p><p style="text-align: justify; margin-top: 11px;"><img src="http://www.rosleshoz.gov.ru/dep/south/press/461/15446629388_d46a49acc5_o.jpg" title="Акция с компанией Алкоа" width="170px" style="float: right; padding: 2px; border: 1px solid rgba(0, 136, 203, 1); border-radius: 5px; margin-left: 7px; margin-top: 7px;" /><small>25 октября 2014 года посадка деревьев прошла на 3 гектарах сгоревшего леса рядом с хутором Поцелуев в Ростовской области при финансовой поддержке Фонда «Алкоа». Помимо сотрудников Алкоа в восстановлении лесов также приняли участие представители администрации Белокалитвинского городского поселения и воспитанники Белокалитвинского казачьего кадетского корпуса им. Матвея Платова. В самом начале мероприятия участников торжественно поприветствовала администрация района, представители ЗАО «Алкоа Металлург Рус» и фонда «Русский Углерод». В продолжение официальной части выступили представители Фонда Антон Чупилко и Алексей Шадрин, рассказав о том, насколько важно восстановление лесов для сохранения биоразнообразия и климата.<br /><p style="border-top: 1px solid #808080; margin-top: 14px;"></p><p style="margin-top: 11px;"><b style="color: #99490E;">Поглощено 1190 тонн CO<sub>2</sub></b><br /><b style="color: #5cb85c;">Восстановлено 12000 деревьев</b><br /><b style="color: #0088CB; font-weight: bold;">Кол-во волонтеров 350 человек</b></small></p></p><br /><a href="#" class="btn btn-success" id="show_event1">Посмотреть восстановленый участок</a>' +
            '</div>', {

            // Переопределяем функцию build, чтобы при создании макета начинать
            // слушать событие click на кнопке-счетчике.
            build: function () {
                // Сначала вызываем метод build родительского класса.
                BalloonContentLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                $('#show_event1').bind('click', this.onCounterClick);
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                $('#show_event1').unbind('click', this.onCounterClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            onCounterClick: function () {

                // Скрываем метки с выбором участков, на карте. Из GeoQuery запроса result.
                result.setOptions('visible', false);

                // Добавляем новый тайл(слой) на карту, ввиде png-картинки леса. На него будем добавлять геообъект(круг), с указанной площадью посаженного леса.
                var layer = new ymaps.Layer("http://intranet.russiancarbon.org/f/min/posadit-les/tiles/tile_forest.png", {
                  projection: ymaps.projection.sphericalMercator
                });

                /*
                var layer = new ymaps.Layer("http://intranet.russiancarbon.org/f/min/posadit-les/tiles/%z/%x-%y.png", {
                  projection: ymaps.projection.sphericalMercator
                });
                */

                // Подстраиваем размер тайла(980px), под масштаб карты. С соответствующим приближением.
                layer.getTileSize = function (zoom) {
                  m = zoom > 12 ? Math.pow(2, zoom - 7.5) : 980;
                  return [m, m];
                };

                // Добавляем новый слой(тайл) на карту.
                myMap.layers.add(layer);

                // Закрываем балун метки с информацией, по выбранной акции Фонда.
                myMap.balloon.close();
                // Отключаем кнопки масштабирования карты, справа вверху. Чтобы была только одна возможность вернуться к выбору участков. По кнопке "Вернуться к выбору участка". В обход тайла с лесом.
                myMap.controls.remove('zoomControl');
                //Отключаем возможность масштабирования колесиком мыши
                myMap.behaviors.disable('scrollZoom');
                /*
                // Будем отслеживать изменение уровня масштабирования карты
                myMap.events.add('boundschange', function (event) {
                  layers_forest.destroy();
                });
                */

                // Добавляем, после показа посаженного леса, на карту кнопку "Вернуться к выбору участка". Чтобы по ней можно было бы обновить карту и вернуться к выбору других акций Фонда.
                // Создаем пользоваетльский макет кнопки. С указанием класс Bootstrap3.
                var ButtonLayout = ymaps.templateLayoutFactory.createClass(
                "<div class='btn btn-warning'>" +
                   "{{data.content}}" +
                "</div>"
                ),
                firstButton = new ymaps.control.Button({
                 data: {
                   content: "Вернуться к выбору участка"
                 },
                 options: {
                   // Подключаем созданный макет.
                   layout: ButtonLayout
                 }
                 });
                // Устанавливаем максимальную ширину кнопки. Чтобы весь текст помещался на ней.
                firstButton.options.set({'selectOnClick': false, 'maxWidth': 200});
                // Указываем расположение кнопки на карте.
                myMap.controls.add(firstButton, {float: 'left'});

                // При нажатии на кнопку, обновляем страницу с картой.
                firstButton.events.add("click", function () {
                 //alert("Клик по кнопке произошел.");
                 document.location.reload();
                });

                // Загружаем через загрузчик модулей, весь код из файла area_square_1.js, по построению площади посаженного леса. Разделенной на квадраты.
                // Действия по добавлению геоколлекции и балуна, на карту, выполняем здесь же в контексте require. Т.к. все загруженные данные не будут доступны вне его. Указываем одну зависимость от jquery.
                require(["http://intranet.russiancarbon.org/f/min/posadit-les/area_square_1.js"], function(jQuery) {
                  // alert("это выполнится только тогда, когда файл area_square_1.js будет загружен");

                  // Открываем в центре круга, балун с информацией о площади посадки.
                  myMap.balloon.open([48.234599, 40.699303], {contentBody: 'Площадь высадки леса - 3 га'});

                  // Добавляем коллекцию на карту.
                  myMap.geoObjects.add(myGeoObjects);
                  // Устанавливаем карте центр и масштаб так, чтобы охватить коллекцию целиком.
                  myMap.setBounds(myGeoObjects.getBounds());

                  /*
                  // При клике на любом из квадратов в коллекции, выводится alert с текстом.
                  // Это может пригодится при заказе посадки леса, на не засаженных участках. Если вся площадь, из пустых квадратов.
                  myGeoObjects.events.add('click', function (e) {
                   alert("Клик по квадрату в коллекции, произошел.");
                  });
                  */

                  // Отслеживаем клик по не засаженному участку леса(пустой квадрат на карте). При клике открываем балун с кнопкой "Заказать посадку леса".
                  // Добавляем обработку клика по ней. Добавляем к кнопке событие onclick - onclick="return Show_zakaz(this);". С вызовом функции Show_zakaz.
                  // Данную функцию помещаем в файл area_square_1.js. Отвечающий за построение площади посаженного леса, по выбранной акции Фонда.
                  squarePlacemark_down_empty.events.add('click', function (e) {

                  // Закрываем балун с площадью посадки.
                  myMap.balloon.close();

                  myMap.balloon.open([48.234065, 40.699303], {contentBody: '<div id="menu_zakaz" style="margin-right: 7px;"><b style="color: #999966; font-size: 12px;">Вы можете посадить здесь деревья<br /><br /></b> <button type="submit" class="btn btn-warning" id="zakaz" onclick="return Show_zakaz(this);" data-toggle="modal" data-target="#myModal">Заказать посадку леса</button></div>'});

                  /*
                  // Таким образом можно отследить клик, по балуну с кнопкой "Заказать посадку леса". На пустых участках.
                  myMap.balloon.events.add('click', function (e) {
                    alert("Клик по кнопке произошел. Оформляйте заказ!");
                  });
                  */

                  });

                });

                }
        });
        // Макет балуна акции с компаниями Алкоа, Топливный регион.
        BalloonContentLayout1 = ymaps.templateLayoutFactory.createClass(
            '<div style="margin: 10px;">' +
              '<p style="background-color: rgba(0, 136, 203, 1) !important; padding: 5px; color: #ffffff;"><b style="font-size: 14px;">Акция с компаниями Алкоа, Топливный регион</b><br /><i style="font-size: 12px;">28 сентября 2013 года | Alcoa Foundation, Топливный регион </i></p><p style="text-align: justify; margin-top: 11px;"><img src="https://russiancarbon.org/r/_gallery/B6009F14-2035-43CA-ABBD-9F6DC4110490/1.jpg" title="Акция с компаниями Алкоа, Топливный регион" width="170px" style="float: right; padding: 2px; border: 1px solid rgba(0, 136, 203, 1); border-radius: 5px; margin-left: 7px; margin-top: 7px;" /><small>В посадках поддержку «Русскому углероду» оказал Фонд Alcoa, который осуществляет глобальную программу «10 миллионов деревьев». В мероприятии участвовали активисты Фонда возрождения лесов, алтайского экоклуба «Черный аист», компания «Топливный регион», студенты и преподаватели МГИМО, блогеры и журналисты. Фонд презентовал свою новую программу «I like green», направленную на восстановление и сохранение лесов России, а также на борьбу с глобальными климатическими изменениями.<br /><p style="border-top: 1px solid #808080; margin-top: 14px;"></p><p style="margin-top: 11px;"><b style="color: #99490E;">Поглощено 1380 тонн CO<sub>2</sub></b><br /><b style="color: #5cb85c;">Восстановлено 13000 деревьев</b><br /><b style="color: #0088CB; font-weight: bold;">Кол-во волонтеров 100 человек</b></small></p></p><br /><a href="#" class="btn btn-success" id="show_event2">Посмотреть восстановленый участок</a>' +
            '</div>', {

            // Переопределяем функцию build, чтобы при создании макета начинать
            // слушать событие click на кнопке-счетчике.
            build: function () {
                // Сначала вызываем метод build родительского класса.
                BalloonContentLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                $('#show_event2').bind('click', this.onCounterClick);
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                $('#show_event2').unbind('click', this.onCounterClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            onCounterClick: function () {

                // Скрываем метки с выбором участков, на карте. Из GeoQuery запроса result.
                result.setOptions('visible', false);

                // Закрываем балун метки с информацией, по выбранной акции Фонда.
                myMap.balloon.close();
                // Отключаем кнопки масштабирования карты, справа вверху. Чтобы была только одна возможность вернуться к выбору участков. По кнопке "Вернуться к выбору участка". В обход тайла с лесом.
                myMap.controls.remove('zoomControl');
                //Отключаем возможность масштабирования колесиком мыши
                myMap.behaviors.disable('scrollZoom');

                // Добавляем, после показа посаженного леса, на карту кнопку "Вернуться к выбору участка". Чтобы по ней можно было бы обновить карту и вернуться к выбору других акций Фонда.
                // Создаем пользоваетльский макет кнопки. С указанием класс Bootstrap3.
                var ButtonLayout = ymaps.templateLayoutFactory.createClass(
                "<div class='btn btn-warning'>" +
                   "{{data.content}}" +
                "</div>"
                ),
                firstButton = new ymaps.control.Button({
                 data: {
                   content: "Вернуться к выбору участка"
                 },
                 options: {
                   // Подключаем созданный макет.
                   layout: ButtonLayout
                 }
                 });
                // Устанавливаем максимальную ширину кнопки. Чтобы весь текст помещался на ней.
                firstButton.options.set({'selectOnClick': false, 'maxWidth': 200});
                // Указываем расположение кнопки на карте.
                myMap.controls.add(firstButton, {float: 'left'});

                // При нажатии на кнопку, обновляем страницу с картой.
                firstButton.events.add("click", function () {
                 //alert("Клик по кнопке произошел.");
                 document.location.reload();
                });

                // Загружаем через загрузчик модулей, весь код из файла area_square_2.js, по построению площади посаженного леса. Разделенной на квадраты.
                // Действия по добавлению геоколлекции и балуна, на карту, выполняем здесь же в контексте require. Т.к. все загруженные данные не будут доступны вне его. Указываем одну зависимость от jquery.
                require(["http://intranet.russiancarbon.org/f/min/posadit-les/area_square_2.js"], function(jQuery) {
                  // alert("это выполнится только тогда, когда файл area_square_1.js будет загружен");

                  // Открываем в центре круга, балун с информацией о площади посадки.
                  myMap.balloon.open([55.363411, 39.736211], {contentBody: 'Площадь высадки леса - 3 га'});

                  // Добавляем коллекцию на карту.
                  myMap.geoObjects.add(myGeoObjects);
                  // Устанавливаем карте центр и масштаб так, чтобы охватить коллекцию целиком.
                  myMap.setBounds(myGeoObjects.getBounds());

                });

                }
        });
        // Макет балуна акции Наш лес. Посади свое дерево.
        BalloonContentLayout2 = ymaps.templateLayoutFactory.createClass(
            '<div style="margin: 10px;">' +
              '<p style="background-color: rgba(0, 136, 203, 1) !important; padding: 5px; color: #ffffff;"><b style="font-size: 14px;">Акция Наш лес. Посади свое дерево.</b><br /><i style="font-size: 12px;">13 сентября 2014 года | Фонд "Русский углерод" </i></p><p style="text-align: justify; margin-top: 11px;"><img src="http://www.forest.ru/upload/main/b12/b12fba239eaa2df056d606c2f0cacb18.jpg" title="Акция Наш лес. Посади свое дерево." width="170px" style="float: right; padding: 2px; border: 1px solid rgba(0, 136, 203, 1); border-radius: 5px; margin-left: 7px; margin-top: 7px;" /><small>Фонд принял участие в акции "Наш лес. Посади свое дерево". В посадке деревьев в Балашихе приняли участие более 3000 человек, как местных жителей, так и членов трудовых коллективов различных государственных и частных организаций и компаний Московской области.<br /><p style="border-top: 1px solid #808080; margin-top: 14px;"></p><p style="margin-top: 11px;"><b style="color: #5cb85c;">Восстановлено 1000 деревьев</b><br /><b style="color: #0088CB; font-weight: bold;">Кол-во волонтеров 15 человек</b></small></p></p><br /><a href="#" class="btn btn-success" id="show_event3">Посмотреть восстановленый участок</a>' +
            '</div>', {

            // Переопределяем функцию build, чтобы при создании макета начинать
            // слушать событие click на кнопке-счетчике.
            build: function () {
                // Сначала вызываем метод build родительского класса.
                BalloonContentLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                $('#show_event3').bind('click', this.onCounterClick);
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                $('#show_event3').unbind('click', this.onCounterClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            onCounterClick: function () {

                // Скрываем метки с выбором участков, на карте. Из GeoQuery запроса result.
                result.setOptions('visible', false);

                // Добавляем новый тайл(слой) на карту, ввиде png-картинки леса. На него будем добавлять геообъект(круг), с указанной площадью посаженного леса.
                var layer = new ymaps.Layer("http://intranet.russiancarbon.org/f/min/posadit-les/tiles/tile_forest.png", {
                  projection: ymaps.projection.sphericalMercator
                });

                // Подстраиваем размер тайла(980px), под масштаб карты. С соответствующим приближением.
                layer.getTileSize = function (zoom) {
                  m = zoom >= 18 ? Math.pow(2, zoom - 7.5) : 980;
                  return [m, m];
                };

                myMap.layers.add(layer);

                // Закрываем балун метки с информацией, по выбранной акции Фонда.
                myMap.balloon.close();
                // Отключаем кнопки масштабирования карты, справа вверху. Чтобы была только одна возможность вернуться к выбору участков. По кнопке "Вернуться к выбору участка". В обход тайла с лесом.
                myMap.controls.remove('zoomControl');
                //Отключаем возможность масштабирования колесиком мыши
                myMap.behaviors.disable('scrollZoom');

                // Добавляем, после показа посаженного леса, на карту кнопку "Вернуться к выбору участка". Чтобы по ней можно было бы обновить карту и вернуться к выбору других акций Фонда.
                // Создаем пользоваетльский макет кнопки. С указанием класс Bootstrap3.
                var ButtonLayout = ymaps.templateLayoutFactory.createClass(
                "<div class='btn btn-warning'>" +
                   "{{data.content}}" +
                "</div>"
                ),
                firstButton = new ymaps.control.Button({
                 data: {
                   content: "Вернуться к выбору участка"
                 },
                 options: {
                   // Подключаем созданный макет.
                   layout: ButtonLayout
                 }
                 });
                // Устанавливаем максимальную ширину кнопки. Чтобы весь текст помещался на ней.
                firstButton.options.set({'selectOnClick': false, 'maxWidth': 200});
                // Указываем расположение кнопки на карте.
                myMap.controls.add(firstButton, {float: 'left'});

                // При нажатии на кнопку, обновляем страницу с картой.
                firstButton.events.add("click", function () {
                 //alert("Клик по кнопке произошел.");
                 document.location.reload();
                });

                // Загружаем через загрузчик модулей, весь код из файла area_square_3.js, по построению площади посаженного леса. Разделенной на квадраты.
                // Действия по добавлению геоколлекции и балуна, на карту, выполняем здесь же в контексте require. Т.к. все загруженные данные не будут доступны вне его. Указываем одну зависимость от jquery.
                require(["http://intranet.russiancarbon.org/f/min/posadit-les/area_square_3.js"], function(jQuery) {
                  // alert("это выполнится только тогда, когда файл area_square_1.js будет загружен");

                  // Открываем в центре круга, балун с информацией о площади посадки.
                  myMap.balloon.open([55.823180, 37.928795], {contentBody: 'Площадь высадки леса - 0.25 га'});

                  // Добавляем коллекцию на карту.
                  myMap.geoObjects.add(myGeoObjects);
                  // Устанавливаем карте центр и масштаб так, чтобы охватить коллекцию целиком.
                  myMap.setBounds(myGeoObjects.getBounds());
                });

                }
        });
        // Макет балуна акции Stop CO2.
        BalloonContentLayout3 = ymaps.templateLayoutFactory.createClass(
            '<div style="margin: 10px;">' +
              '<p style="background-color: rgba(0, 136, 203, 1) !important; padding: 5px; color: #ffffff;"><b style="font-size: 14px;">Акция Stop CO2</b><br /><i style="font-size: 12px;">19 мая 2012 года | Bureau Veritas </i></p><p style="text-align: justify; margin-top: 11px;"><img src="https://russiancarbon.org/r/_gallery/1CA49BAB-6342-40ED-857C-01324219D0A3/banner.jpg" title="Акция Stop CO2" width="170px" style="float: right; padding: 2px; border: 1px solid rgba(0, 136, 203, 1); border-radius: 5px; margin-left: 7px; margin-top: 7px;" /><small>19 мая неподалеку от деревни Федерово Орехово-Зуевского района прошла первая акция в рамках климатической программы «Зеленое дыхание планеты». Посадка леса осуществлялась совместно с Фондом возрождения лесов, аудиторской компанией «Бюро Веритас» и движением молодых политических экологов «Местные» при поддержке Управления лесного хозяйства по Москве и Московской области.<br /><p style="border-top: 1px solid #808080; margin-top: 14px;"></p><p style="margin-top: 11px;"><b style="color: #5cb85c;">Восстановлено 6000 деревьев</b><br /><b style="color: #0088CB; font-weight: bold;">Кол-во волонтеров 28 человек</b></small></p></p><br /><a href="#" class="btn btn-success" id="show_event4">Посмотреть восстановленый участок</a>' +
            '</div>', {

            // Переопределяем функцию build, чтобы при создании макета начинать
            // слушать событие click на кнопке-счетчике.
            build: function () {
                // Сначала вызываем метод build родительского класса.
                BalloonContentLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                $('#show_event4').bind('click', this.onCounterClick);
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                $('#show_event4').unbind('click', this.onCounterClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            onCounterClick: function () {

                // Скрываем метки с выбором участков, на карте. Из GeoQuery запроса result.
                result.setOptions('visible', false);

                // Добавляем новый тайл(слой) на карту, ввиде png-картинки леса. На него будем добавлять геообъект(круг), с указанной площадью посаженного леса.
                var layer = new ymaps.Layer("http://intranet.russiancarbon.org/f/min/posadit-les/tiles/tile_forest.png", {
                  projection: ymaps.projection.sphericalMercator
                });

                // Подстраиваем размер тайла(980px), под масштаб карты. С соответствующим приближением.
                layer.getTileSize = function (zoom) {
                  m = zoom >= 18 ? Math.pow(2, zoom - 7.5) : 980;
                  return [m, m];
                };

                myMap.layers.add(layer);

                // Закрываем балун метки с информацией, по выбранной акции Фонда.
                myMap.balloon.close();
                // Отключаем кнопки масштабирования карты, справа вверху. Чтобы была только одна возможность вернуться к выбору участков. По кнопке "Вернуться к выбору участка". В обход тайла с лесом.
                myMap.controls.remove('zoomControl');
                //Отключаем возможность масштабирования колесиком мыши
                myMap.behaviors.disable('scrollZoom');

                // Добавляем, после показа посаженного леса, на карту кнопку "Вернуться к выбору участка". Чтобы по ней можно было бы обновить карту и вернуться к выбору других акций Фонда.
                // Создаем пользоваетльский макет кнопки. С указанием класс Bootstrap3.
                var ButtonLayout = ymaps.templateLayoutFactory.createClass(
                "<div class='btn btn-warning'>" +
                   "{{data.content}}" +
                "</div>"
                ),
                firstButton = new ymaps.control.Button({
                 data: {
                   content: "Вернуться к выбору участка"
                 },
                 options: {
                   // Подключаем созданный макет.
                   layout: ButtonLayout
                 }
                 });
                // Устанавливаем максимальную ширину кнопки. Чтобы весь текст помещался на ней.
                firstButton.options.set({'selectOnClick': false, 'maxWidth': 200});
                // Указываем расположение кнопки на карте.
                myMap.controls.add(firstButton, {float: 'left'});

                // При нажатии на кнопку, обновляем страницу с картой.
                firstButton.events.add("click", function () {
                 //alert("Клик по кнопке произошел.");
                 document.location.reload();
                });

                // Загружаем через загрузчик модулей, весь код из файла area_square_4.js, по построению площади посаженного леса. Разделенной на квадраты.
                // Действия по добавлению геоколлекции и балуна, на карту, выполняем здесь же в контексте require. Т.к. все загруженные данные не будут доступны вне его. Указываем одну зависимость от jquery.
                require(["http://intranet.russiancarbon.org/f/min/posadit-les/area_square_4.js"], function(jQuery) {
                  // alert("это выполнится только тогда, когда файл area_square_1.js будет загружен");

                  // Открываем в центре круга, балун с информацией о площади посадки.
                  myMap.balloon.open([48.234599, 40.699303], {contentBody: 'Площадь высадки леса - 1.5 га'});

                  // Добавляем коллекцию на карту.
                  myMap.geoObjects.add(myGeoObjects);
                  // Устанавливаем карте центр и масштаб так, чтобы охватить коллекцию целиком.
                  myMap.setBounds(myGeoObjects.getBounds());
                });

                }
        });
        // Макет балуна акции День дерева.
        BalloonContentLayout4 = ymaps.templateLayoutFactory.createClass(
            '<div style="margin: 10px;">' +
              '<p style="background-color: rgba(0, 136, 203, 1) !important; padding: 5px; color: #ffffff;"><b style="font-size: 14px;">Акция День дерева</b><br /><i style="font-size: 12px;">20 октября 2012 года | Deutsche Bank </i></p><p style="text-align: justify; margin-top: 11px;"><img src="http://russiancarbon.org/r/_content/baners/day_tree.jpg" title="Акция День дерева" width="170px" style="float: right; padding: 2px; border: 1px solid rgba(0, 136, 203, 1); border-radius: 5px; margin-left: 7px; margin-top: 7px;" /><small>Фонд «Русский Углерод», совместно с компанией "Дойче Банк", Фондом возрождения лесов и журналом «Дерево.RU» провели «День Дерева» - первый в истории России праздник, посвященный дереву, как одному из ключевых элементов устойчивого состояния биосферы и жизни на планете. Праздник состоялся 20 октября в Орехово-Зуевском районе Московской области.<br /><p style="border-top: 1px solid #808080; margin-top: 14px;"></p><p style="margin-top: 11px;"><b style="color: #5cb85c;">Восстановлено 8000 деревьев</b><br /><b style="color: #0088CB; font-weight: bold;">Кол-во волонтеров 36 человек</b></small></p></p><br /><a href="#" class="btn btn-success" id="show_event5">Посмотреть восстановленый участок</a>' +
            '</div>', {

            // Переопределяем функцию build, чтобы при создании макета начинать
            // слушать событие click на кнопке-счетчике.
            build: function () {
                // Сначала вызываем метод build родительского класса.
                BalloonContentLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                $('#show_event5').bind('click', this.onCounterClick);
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                $('#show_event5').unbind('click', this.onCounterClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            onCounterClick: function () {

                // Скрываем метки с выбором участков, на карте. Из GeoQuery запроса result.
                result.setOptions('visible', false);

                // Закрываем балун метки с информацией, по выбранной акции Фонда.
                myMap.balloon.close();
                // Отключаем кнопки масштабирования карты, справа вверху. Чтобы была только одна возможность вернуться к выбору участков. По кнопке "Вернуться к выбору участка". В обход тайла с лесом.
                myMap.controls.remove('zoomControl');
                //Отключаем возможность масштабирования колесиком мыши
                myMap.behaviors.disable('scrollZoom');

                // Добавляем, после показа посаженного леса, на карту кнопку "Вернуться к выбору участка". Чтобы по ней можно было бы обновить карту и вернуться к выбору других акций Фонда.
                // Создаем пользоваетльский макет кнопки. С указанием класс Bootstrap3.
                var ButtonLayout = ymaps.templateLayoutFactory.createClass(
                "<div class='btn btn-warning'>" +
                   "{{data.content}}" +
                "</div>"
                ),
                firstButton = new ymaps.control.Button({
                 data: {
                   content: "Вернуться к выбору участка"
                 },
                 options: {
                   // Подключаем созданный макет.
                   layout: ButtonLayout
                 }
                 });
                // Устанавливаем максимальную ширину кнопки. Чтобы весь текст помещался на ней.
                firstButton.options.set({'selectOnClick': false, 'maxWidth': 200});
                // Указываем расположение кнопки на карте.
                myMap.controls.add(firstButton, {float: 'left'});

                // При нажатии на кнопку, обновляем страницу с картой.
                firstButton.events.add("click", function () {
                 //alert("Клик по кнопке произошел.");
                 document.location.reload();
                });

                // Загружаем через загрузчик модулей, весь код из файла area_square_5.js, по построению площади посаженного леса. Разделенной на квадраты.
                // Действия по добавлению геоколлекции и балуна, на карту, выполняем здесь же в контексте require. Т.к. все загруженные данные не будут доступны вне его. Указываем одну зависимость от jquery.
                require(["http://intranet.russiancarbon.org/f/min/posadit-les/area_square_5.js"], function(jQuery) {
                  // alert("это выполнится только тогда, когда файл area_square_1.js будет загружен");

                  // Открываем в центре круга, балун с информацией о площади посадки.
                  myMap.balloon.open([55.647931, 38.859452], {contentBody: 'Площадь высадки леса - 2 га'});

                  // Добавляем коллекцию на карту.
                  myMap.geoObjects.add(myGeoObjects);
                  // Устанавливаем карте центр и масштаб так, чтобы охватить коллекцию целиком.
                  myMap.setBounds(myGeoObjects.getBounds());
                });
                }
        });
        // Макет балуна акции Поможем Природе вместе!
        BalloonContentLayout5 = ymaps.templateLayoutFactory.createClass(
            '<div style="margin: 10px;">' +
              '<p style="background-color: rgba(0, 136, 203, 1) !important; padding: 5px; color: #ffffff;"><b style="font-size: 14px;">Акция Поможем Природе вместе!</b><br /><i style="font-size: 12px;">15 мая 2013 года | PepsiCo </i></p><p style="text-align: justify; margin-top: 11px;"><img src="http://img-fotki.yandex.ru/get/6803/118032170.5d/0_c6a23_c1882c1f_XXL.jpg" title="Акция Поможем Природе вместе!" width="170px" style="float: right; padding: 2px; border: 1px solid rgba(0, 136, 203, 1); border-radius: 5px; margin-left: 7px; margin-top: 7px;" /><small>Масштабная посадка в рамках программы "Зеленое дыхание планеты" состоялась вместе с компанией "ПепсиКо" и ее брендом "Родники России". В акции приняли участие более 160 волонтеров, представители власти, федеральные, местные и региональные СМИ, НКО, молодежные движения.<br /><p style="border-top: 1px solid #808080; margin-top: 14px;"></p><p style="margin-top: 11px;"><b style="color: #99490E;">Поглощено 2354 тонны CO<sub>2</sub></b><br /><b style="color: #5cb85c;">Восстановлено 25000 деревьев</b><br /><b style="color: #0088CB; font-weight: bold;">Кол-во волонтеров 170 человек</b></small></p></p><br /><a href="#" class="btn btn-success" id="show_event7">Посмотреть восстановленый участок</a>' +
            '</div>', {

            // Переопределяем функцию build, чтобы при создании макета начинать
            // слушать событие click на кнопке-счетчике.
            build: function () {
                // Сначала вызываем метод build родительского класса.
                BalloonContentLayout.superclass.build.call(this);
                // А затем выполняем дополнительные действия.
                $('#show_event7').bind('click', this.onCounterClick);
            },

            // Аналогично переопределяем функцию clear, чтобы снять
            // прослушивание клика при удалении макета с карты.
            clear: function () {
                // Выполняем действия в обратном порядке - сначала снимаем слушателя,
                // а потом вызываем метод clear родительского класса.
                $('#show_event7').unbind('click', this.onCounterClick);
                BalloonContentLayout.superclass.clear.call(this);
            },

            onCounterClick: function () {

                // Скрываем метки с выбором участков, на карте. Из GeoQuery запроса result.
                result.setOptions('visible', false);

                // Закрываем балун метки с информацией, по выбранной акции Фонда.
                myMap.balloon.close();
                // Отключаем кнопки масштабирования карты, справа вверху. Чтобы была только одна возможность вернуться к выбору участков. По кнопке "Вернуться к выбору участка". В обход тайла с лесом.
                myMap.controls.remove('zoomControl');
                //Отключаем возможность масштабирования колесиком мыши
                myMap.behaviors.disable('scrollZoom');
                /*
                // Будем отслеживать изменение уровня масштабирования карты
                myMap.events.add('boundschange', function (event) {
                  layers_forest.destroy();
                });
                */

                // Добавляем, после показа посаженного леса, на карту кнопку "Вернуться к выбору участка". Чтобы по ней можно было бы обновить карту и вернуться к выбору других акций Фонда.
                // Создаем пользоваетльский макет кнопки. С указанием класс Bootstrap3.
                var ButtonLayout = ymaps.templateLayoutFactory.createClass(
                "<div class='btn btn-warning'>" +
                   "{{data.content}}" +
                "</div>"
                ),
                firstButton = new ymaps.control.Button({
                 data: {
                   content: "Вернуться к выбору участка"
                 },
                 options: {
                   // Подключаем созданный макет.
                   layout: ButtonLayout
                 }
                 });
                // Устанавливаем максимальную ширину кнопки. Чтобы весь текст помещался на ней.
                firstButton.options.set({'selectOnClick': false, 'maxWidth': 200});
                // Указываем расположение кнопки на карте.
                myMap.controls.add(firstButton, {float: 'left'});

                // При нажатии на кнопку, обновляем страницу с картой.
                firstButton.events.add("click", function () {
                 //alert("Клик по кнопке произошел.");
                 document.location.reload();
                });

                // Загружаем через загрузчик модулей, весь код из файла area_square_7.js, по построению площади посаженного леса. Разделенной на квадраты.
                // Действия по добавлению геоколлекции и балуна, на карту, выполняем здесь же в контексте require. Т.к. все загруженные данные не будут доступны вне его. Указываем одну зависимость от jquery.
                require(["http://intranet.russiancarbon.org/f/min/posadit-les/area_square_7.js"], function(jQuery) {
                  // alert("это выполнится только тогда, когда файл area_square_1.js будет загружен");

                  // Открываем в центре круга, балун с информацией о площади посадки.
                  myMap.balloon.open([55.510522, 38.500622], {contentBody: 'Площадь высадки леса - 6 га'});

                  // Добавляем коллекцию на карту.
                  myMap.geoObjects.add(myGeoObjects);
                  // Устанавливаем карте центр и масштаб так, чтобы охватить коллекцию целиком.
                  myMap.setBounds(myGeoObjects.getBounds());
                });
                }
        });

    // Сохраняем значение this.yMap в переменнную myMap.
    var myMap = this.yMap;

    // Создание GeoQueryResult из JSON. С акциями по посадке. Все данные выводятся в макетах балунов, соответствующих акций.
    var result = ymaps.geoQuery({
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    55.81417815,
                    38.82883800

                ]
            },
            "properties": {
                "hintContent": "Акция Stop CO2"
            },
            "options": {
                "preset": "islands#darkGreenCircleDotIcon",
                balloonMaxHeight: 800,
                balloonContentLayout: BalloonContentLayout3
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    55.647931,
                    38.85945
                ]
            },
            "properties": {
                "hintContent": "Акция День дерева"
            },
            "options": {
                "preset": "islands#darkGreenCircleDotIcon",
                balloonMaxHeight: 800,
                balloonContentLayout: BalloonContentLayout4
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    55.5105,
                    38.5006
                ]
            },
            "properties": {
                "hintContent": "Акция Поможем Природе вместе!"
            },
            "options": {
                "preset": "islands#darkGreenCircleDotIcon",
                balloonMaxHeight: 800,
                balloonContentLayout: BalloonContentLayout5
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    55.3634,
                    39.7362
                ]
            },
            "properties": {
                "hintContent": "Акция с компаниями Алкоа, Топливный регион"
            },
            "options": {
                "preset": "islands#darkGreenCircleDotIcon",
                balloonMaxHeight: 800,
                balloonContentLayout: BalloonContentLayout1
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    55.823180,
                    37.928795
                ]
            },
            "properties": {
                "hintContent": "Акция Наш лес. Посади свое дерево"
            },
            "options": {
                "preset": "islands#darkGreenCircleDotIcon",
                balloonMaxHeight: 800,
                balloonContentLayout: BalloonContentLayout2
            }
        },
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [
                    48.234599,
                    40.699303
                ]
            },
            "properties": {
                "hintContent": "Акция с компанией Алкоа"
            },
            "options": {
                "preset": "islands#darkGreenCircleDotIcon",
                balloonMaxHeight: 800,
                // Балун будет всплывать над меткой.
                //balloonPanelMaxMapArea: 0,
                // Если карта имеет маленькие размеры, то балун будет отображаться в виде панели в нижней части карты.
                //balloonPanelMaxMapArea: Infinity,
                balloonContentLayout: BalloonContentLayout
            }
        }
    ]
}).applyBoundsToMap(myMap, {checkZoomRange: true}); // Делаем приближение карты так, чтобы на ней были охвачены все объекты.
// Добавляем объекты на карту, методом кластеризации. Ближ. объекты будут объединятся в кластеры. Также задаем стиль для метки кластера.
myMap.geoObjects.add(result.clusterize()).options.set("preset", "islands#invertedDarkGreenClusterIcons");


// С помощью jQuery.getJSON, подгружаем соответствующий файл с акциями по посадке деревьев.
/*
jQuery.getJSON('/f/min/map/posadki.json', function (json) {
  var geoObjects = ymaps.geoQuery(json)
   .addToMap(myMap)
   .applyBoundsToMap(myMap, {
   checkZoomRange: true
   });
});
*/

};


//Инициализация карты
Map.prototype.init = function () {
   this.root.addClass('ymap-ready');
};

   als.Map = Map;
   return Map;
});