console.log('hello');
var a = 100;
var bytes = undefined;
var blob = undefined;

var urlCreator = undefined;
var imageUrl = undefined;
var imjoy_loaded_state = false;

function atou(b64) {
  return decodeURIComponent(escape(atob(b64)));
}
function utoa(data) {
  return btoa(unescape(encodeURIComponent(data)));
}

const validate_message = event_data => {
  if (typeof event_data === 'string') {
    try {
      let event_data_json = JSON.parse(event_data);
      if ('fn_name' in event_data_json) {
        return true;
      }
    } catch (e) {
      return false;
    }
  } else if (event_data.type === 'initialized') {
    console.log('--------------------imjoyRPCReady!!!--------------------');
    imjoy_loaded_state = true;
    return false;
  } else {
    return false;
  }
};

window.addEventListener(
    'message',
    async function (event) {
      // console.log(event);
      // We only accept messages from ourselves
      if (!validate_message(event.data)) {
        // console.log("skipping message");
        return;
      }
      while (!imjoy_loaded_state) {
        console.log('waiting for imjoy to load');
        // check of ij is undefined
        if (typeof ij === 'undefined') {
          console.log('');
        } else {
          console.log('================ij is loaded================');
        }
        // wait for imjoy to load
        await new Promise(r => setTimeout(r, 1000));
      }

      console.log('received message in webview: ');

      console.log(event.data);
      let event_data_json = JSON.parse(event.data);

      // load function name and args from event.data
      var fn_name = event_data_json.fn_name;
      var args = event_data_json.args;
      // call the function
      console.log('checking if function ' + fn_name + ' exists');
      if (fn_name in window) {
        console.log('exists! calling function ' + fn_name);
        let fn_output_string = await window[fn_name](args);
        let response_string = JSON.stringify({
          input: event.data,
          ret_json_string: fn_output_string,
        });
        console.log('function called');
        console.log('return length: ' + response_string.length);
        window.ReactNativeWebView.postMessage(response_string);
        // window.ReactNativeWebView.postMessage(ij);

      } else {
        console.log('function ' + fn_name + ' does not exist');
      }
    },
    false,
);

async function test_fn(args) {
  console.log('test_fn called');
  console.log('args: ' + args);
  return JSON.stringify({a: 1, b: 2});
}

function convert_bytes_to_utf8(bytes) {
  return utoa(bytes);
}

function load_image_from_utf8(utf8_string) {
  console.log('TRYING TO LOAD IMAGE FROM UTF8');
  console.log('utf8_string length: ' + utf8_string.length);
  var bytes = atou(utf8_string);
  console.log('bytes length: ' + bytes.length);
  cheerpjAddStringFile('/str/custom_file_lol.jpg', bytes);
  ij.open('/str/custom_file_lol.jpg');
  console.log('IMAGE OPENED');
}

function convert_utf8_to_bytes(utf8_string) {
  return atou(utf8_string);
}


function convert_bytes_to_b64(bytes) {
  console.log('TRYING TO CONVERT BYTES TO B64');
  console.log('bytes length: ' + bytes.length);
  // var b64_string = btoa(String.fromCharCode.apply(null, bytes));
  // above line gives error: Maximum call stack size exceeded
  // so we do it in chunks
  var b64_string = '';
  var chunk_size = 64;
  var num_chunks = Math.ceil(bytes.length / chunk_size);
  console.log('num_chunks: ' + num_chunks);
  for (var b_idx = 0; b_idx < num_chunks; b_idx++) {
    var start_idx = b_idx * chunk_size;
    var end_idx = Math.min((b_idx + 1) * chunk_size, bytes.length);
    console.log('b_idx: ' + b_idx);
    var chunk = bytes.slice(start_idx, end_idx);
    console.log('chunk ' + b_idx + ' length: ' + chunk.length);
    // var chunk_b64_string = btoa(String.fromCharCode.apply(null, chunk));
    var decoder = new TextDecoder('utf8');
    var chunk_b64_string = btoa(decoder.decode(chunk))
    b64_string += chunk_b64_string;
  }
  return b64_string;
}

function ArrayBufferToString2(buffer) {
  return BinaryToString(String.fromCharCode.apply(null, Array.prototype.slice.apply(new Uint8Array(buffer))));
}
function ArrayBufferToString(buffer) {
  var uint8Array = new Uint8Array(buffer);
  var stringArray = [];

  for (var i = 0; i < uint8Array.length; i++) {
    stringArray.push(String.fromCharCode(uint8Array[i]));
  }

  return stringArray.join('');
}

function StringToArrayBuffer(string) {
  return StringToUint8Array(string).buffer;
}

function BinaryToString(binary) {
  var error;

  try {
    return decodeURIComponent(escape(binary));
  } catch (_error) {
    error = _error;
    if (error instanceof URIError) {
      return binary;
    } else {
      throw error;
    }
  }
}

function StringToBinary(string) {
  var chars, code, i, isUCS2, len, _i;

  len = string.length;
  chars = [];
  isUCS2 = false;
  for (i = _i = 0; 0 <= len ? _i < len : _i > len; i = 0 <= len ? ++_i : --_i) {
    code = String.prototype.charCodeAt.call(string, i);
    if (code > 255) {
      isUCS2 = true;
      chars = null;
      break;
    } else {
      chars.push(code);
    }
  }
  if (isUCS2 === true) {
    return unescape(encodeURIComponent(string));
  } else {
    return String.fromCharCode.apply(null, Array.prototype.slice.apply(chars));
  }
}

function StringToUint8Array(string) {
  var binary, binLen, buffer, chars, i, _i;
  binary = StringToBinary(string);
  binLen = binary.length;
  buffer = new ArrayBuffer(binLen);
  chars  = new Uint8Array(buffer);
  for (i = _i = 0; 0 <= binLen ? _i < binLen : _i > binLen; i = 0 <= binLen ? ++_i : --_i) {
    chars[i] = String.prototype.charCodeAt.call(binary, i);
  }
  return chars;
}

function load_image_from_b64(b64_string) {
  bytes = convert_b64_to_bytes(b64_string);
  cheerpjAddStringFile('/str/custom_file_lol.jpg', bytes);
  ij.open('/str/custom_file_lol.jpg');
  console.log('IMAGE OPENED');
}

function convert_b64_to_bytes(b64_string) {
  console.log('TRYING TO CONVERT B64 TO BYTES');
  var bytes = atob(b64_string);
  return bytes;
}

async function particle_analysis_macro() {
  ij.runMacro(`run("8-bit");
setAutoThreshold("Default");
////run("Threshold...");
setThreshold(56, 182);
////setThreshold(56, 182);
setOption("BlackBackground", false);
run("Convert to Mask");
run("Analyze Particles...", "size=500-Infinity show=Overlay");
`);
  // imp = ij.getImage();
  // res_uint8 = ij.saveAsBytes(imp, "png");
  // res_b64 = convert_bytes_to_b64(res_uint8);
  // return res_b64;
}

function bytearr_to_url(bytearr) {
  var blob = new Blob([bytearr], {type: 'image/png'});
  var urlCreator = window.URL || window.webkitURL;
  var imageUrl = urlCreator.createObjectURL(blob);
  return imageUrl;
}


async function get_image2() {
  console.log('GETTING IMAGE');
  let imp_custom = await ij.getImage();
  let res_png = await ij.saveAsBytes(imp_custom, 'png');
  let res_url = bytearr_to_url(res_png);
  const reader = new FileReader();
  reader.onloadend = function () {
    concole.log('reader loaded');
    let fn_output_string = reader.result.split(",")[1];
    let response_string = JSON.stringify({
      input: 'get_image',
      ret_json_string: fn_output_string,
    });
    console.log('function called');
    console.log('return length: ' + response_string.length);
    window.ReactNativeWebView.postMessage(response_string);
    // return base64Data;
    // window.ReactNativeWebView.postMessage(base64Data);
  };
  reader.readAsDataURL(res_url);
  // return res_url;
  // let px = await ij.getPixels(imp_custom);
  // convert the Int32Array to a Array of numbers
  // let px_arr = Array.from(px);
  // convert the Array to string
  // let px_str = px_arr.toString();
  // convert the string to a b64 string
  // let px_b64 = btoa(px_str);
  // return the b64 string
  // return px_b64;

}

async function get_image() {
  console.log('GETTING IMAGE');
  let imp_custom = await ij.getImage();
  let res_png = await ij.saveAsBytes(imp_custom, 'png');
  let res_url = bytearr_to_url(res_png);

  try {
    const response = await fetch(res_url);
    const blob = await response.blob();

    const reader = new FileReader();
    reader.onloadend = function () {
      console.log('reader loaded');
      let fn_output_string = reader.result.split(",")[1];
      const trimmedBase64Data = fn_output_string.trim();
      const validBase64Data = trimmedBase64Data.replace(/[^A-Za-z0-9+/=]/g, '');

      let response_string = JSON.stringify({
        input: JSON.stringify({fn_name: 'get_image'}),
        ret_json_string: validBase64Data,
      });
      console.log('function called');
      console.log('return length: ' + response_string.length);
      window.ReactNativeWebView.postMessage(response_string);
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.log('Error fetching or reading image data:', error);
  }
}


async function get_image2() {
  console.log('GETTING IMAGE');
  let imp_custom = await ij.getImage();
  let res_uint8 = await ij.saveAsBytes(imp_custom, 'png').then(function (res_uint8) {
    // let rs =  JSON.stringify(Array.from(res_uint8));
    // rs = convert_bytes_to_utf8(res_uint8.slice(1).buffer);
    // rs = new TextEncoder().encode(res_uint8);
    // let rs = atou(res_uint8);
    let rs = ArrayBufferToString(res_uint8);
    console.log('rs length: ' + rs.length);
    return rs;
  });
  // log first 100 chars
  console.log(res_uint8.slice(0, 100));
  return res_uint8;

  // return JSON.stringify(Array.from(res_uint8.value))
  // return convert_bytes_to_b64(res_uint8);
}

