function getDeliveries() {
    sendRequest(function () {

            var content = $('#shoplogistic_widget');

            if (this.readyState === 4 && this.status === 200) {
                content.append(
                    "<xmp>" +
                    this.responseText +
                    "</xmp>"
                );
            } else if (this.readyState === 4) {
                content.append(
                    "Ошибка загрузки данных виджетом:<br/>" +
                    this.readyState + ' : ' + this.status + ' : ' + this.responseText
                );
            }
        },
        //'http://client-shop-logistics.ru/index.php?route=deliveries/api'
        'https://test.client-shop-logistics.ru/index.php?route=deliveries/api' // testing, demo@shop-logistics.ru/demo, в плагине JetBrains IDE Support указать <all_urls>
    );
}

function sendRequest(callback, url) {
    var xhr;
    var method = 'POST';
    var apiKey = '577888574a3e4df01867cd5ccc9f18a5'; // testing

    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP'); // code for old IE browsers
    }
    xhr.onreadystatechange = callback;
    if ('withCredentials' in xhr) {
        xhr.open(method, url, true); // Chrome/Firefox/Opera/Safari.
    } else if (typeof XDomainRequest !== 'undefined') {
        xhr = new XDomainRequest();  //IE
        xhr.open(method, url);
    } else {
        xhr.open(method, url);
    }
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send('xml=' +
        encodeURIComponent(
            Base64.encode(
                '<request>' +
                '<function>get_deliveries_tarifs</function>' +
                '<api_id>' + apiKey + '</api_id>' +
                '<from_city>405065</from_city>' +
                '<to_city>Калининград</to_city>' +
                '<weight>1</weight>' +
                '<order_length></order_length>' +
                '<order_width></order_width>' +
                '<order_height></order_height>' +
                '<order_price>1000.00</order_price>' +
                '<ocen_price>1000.00</ocen_price>' +
                '<num>1</num>' +
                '</request>'
            )
        )
    );
}

var Base64 = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Base64._utf8_encode(input);
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
        output = Base64._utf8_decode(output);
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
};