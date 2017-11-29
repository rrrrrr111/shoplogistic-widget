var ShopLogisticWidget = {
    startCalculationButtonObserver: function () {

        setInterval(function () {
            var $oldButton = $('a#shop2-edost-calc');
            if (!$oldButton || !$oldButton.is(':visible')) {
                return
            }

            $oldButton.hide();
            $oldButton.parent().append(
                '<a id="shoplogistic-calc-button" href="#" class="shop2-btn" style="color: #f75e82;">Рассчитать</a>');

            var $newButton = $('a#shoplogistic-calc-button');
            $newButton.on("click", function () {

                var container = $('div#delivery-725641-html');
                if (container === null || container === undefined) {
                    console.error('Deliveries container not found');
                    return;
                }

                var price = '1000.00'; // цена товара
                var fee = 70; // дополнительная комиссия добавляемая к сумме доставки
                var weight = '1';
                var toCity = ShopLogisticWidget.getToCity();  // место назначения
                ShopLogisticWidget.showWidget(toCity, weight, price, fee, container);
            });
        }, 3000);
    },
    getToCity: function () {
        return 'Балтийск, Калининградская обл.';
    },

    // for example 'Балтийск, Калининградская обл.'
    showWidget: function (to_city, weight, price, fee, container) {

        this.findTarifs(to_city, weight, price, function (tarifs) {

            var html = '<div style="display: block">';
            html += '<h2>Служба доставки</h2>'
            html += '<div class="shop2-edost">'


            for (var i = 0; i < tarifs.length; i++) {
                var tarif = tarifs[i];
                html += '<div class="shop2-edost-variant shop-logistic-variant"><label>';
                html += '<span style="float: left; width: 40px; min-height: 30px;"><div class="jq-radio" style="user-select: none; display: inline-block; position: relative;"><input type="radio" name="725641[edost][tarif]" value="2:0" style="position: absolute; z-index: -1; opacity: 0;"><div class="jq-radio__div"></div></div></span>';

                html += (tarif.tarifs_type === '1'
                            ? (tarif.pickup_place.indexOf('курьер') >= 0 ? tarif.pickup_place : 'Курьером ' + tarif.pickup_place)
                            : (tarif.pickup_place.indexOf('ПВЗ') >= 0 ? tarif.pickup_place.replace('ПВЗ', 'Пункт выдачи заказов') : ('Пункт выдачи заказов: ' + tarif.pickup_place))
                    ) +
                    ' - <b>' + (tarif.price + fee) + '</b> руб.'
                    + '<div style="font-size: 11px;">' + tarif.address + ', ' + tarif.phone + '</div>';

                html += '</label></div>';
            }
            html += '</div></div>';

            container.html(html);
        });
    },

    findTarifs: function (to_city, weight, price, tarifsCallback) {
        this.sendRequest(function (responseXml) {

                if (responseXml === null || responseXml === undefined
                    || (typeof responseXml === 'string' && !responseXml.startsWith('<?xml'))) {

                    console.error('Error in responseXml on loading data by shoplogistic widget: ' + responseXml);
                    return [];
                }
                var tarifs = [];
                var $xml = $($.parseXML(responseXml));

                $xml.find('answer>tarifs>tarif').each(function () {
                    var $tarif = $(this);

                    tarifs.push({
                        price: parseInt($tarif.find('price').text()), // цена
                        tarifs_type: $tarif.find('tarifs_type').text(), // Тип тарифа 1- курьерская, 2 - ПВЗ
                        srok_dostavki: $tarif.find('srok_dostavki').text(),//
                        pickup_place: $tarif.find('pickup_place').text(),//Название ПВЗ
                        pickup_places_type_name: $tarif.find('pickup_places_type_name').text(),//
                        address: $tarif.find('address').text(),//
                        proezd_info: $tarif.find('proezd_info').text(),//
                        phone: $tarif.find('phone').text(),//
                        worktime: $tarif.find('worktime').text(),//
                        comission_percent: $tarif.find('comission_percent').text(),//
                        is_terminal: $tarif.find('is_terminal').text(),//
                        to_city_code: $tarif.find('to_city_code').text(),//
                        pickup_place_code: $tarif.find('pickup_place_code').text(),//
                        delivery_partner: $tarif.find('delivery_partner').text(),//
                        partner: $tarif.find('partner').text(),//
                        is_basic: $tarif.find('is_basic').text(),//
                        obl_km_pay: $tarif.find('obl_km_pay').text(),//
                        latitude: $tarif.find('latitude').text(),//
                        longitude: $tarif.find('longitude').text()//
                    });
                });
                if (tarifs.length === 0) {
                    var error = $xml.find('answer>error').text();
                    if (error !== '0') {
                        console.error('Error in answer on loading data by shoplogistic widget: ' + error);
                    }
                }
                tarifsCallback(tarifs);
            },
            to_city, weight, price
        );
    },

    sendRequest: function (requestCallback,
                           to_city,
                           weight,
                           price) {
        var apiKey = '577888574a3e4df01867cd5ccc9f18a5'; // testing
        $.ajax({
            //url: 'http://client-shop-logistics.ru/index.php?route=deliveries/api',
            url: 'https://test.client-shop-logistics.ru/index.php?route=deliveries/api', // testing, demo@shop-logistics.ru/demo, в плагине JetBrains IDE Support указать <all_urls>,
            method: 'POST',
            data: 'xml=' + encodeURIComponent(
                this.Base64.encode(
                    '<request>' +
                    '<function>get_deliveries_tarifs</function>' +
                    '<api_id>' + apiKey + '</api_id>' +
                    '<from_city>405065</from_city>' +
                    '<to_city>' + to_city + '</to_city>' +
                    '<weight>' + weight + '</weight>' +
                    '<order_length></order_length>' +
                    '<order_width></order_width>' +
                    '<order_height></order_height>' +
                    '<order_price>' + price + '</order_price>' +
                    '<ocen_price>' + price + '</ocen_price>' +
                    '<num>1</num>' +
                    '</request>'
                )
            )
        }).success(function (data, textStatus, jqXhr) {
            requestCallback(data)
        }).fail(function (jqXhr, textStatus, errorThrown) {
            console.error('Error in response on loading data by shoplogistic widget: ' + textStatus + ': ' + errorThrown);
        });
    },

    Base64: {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;
            input = this._utf8_encode(input);
            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;
                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";

            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },
        decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;
            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = this._utf8_decode(output);
            return output;

        },
        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c = c1 = c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        }
    }
};


