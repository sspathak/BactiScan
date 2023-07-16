console.log('hello');
var a = 100;
var bytes = undefined;
var blob = undefined;

var imjoy_loaded_state = false;

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
}

function bytearr_to_url(bytearr) {
  var blob = new Blob([bytearr], {type: 'image/png'});
  var urlCreator = window.URL || window.webkitURL;
  var imageUrl = urlCreator.createObjectURL(blob);
  return imageUrl;
}


function javaBytesToArrayBuffer(bytes_1) {
  return bytes_1.slice(1).buffer;
}


async function get_image() {
  console.log('GETTING IMAGE');
  let imp_custom = await ij.getImage();
  let res_png = javaBytesToArrayBuffer(await ij.saveAsBytes(imp_custom, 'png'));
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
