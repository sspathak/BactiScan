console.log('hello');
var a = 100;
var bytes = undefined;
var blob = undefined;

var urlCreator = undefined;
var imageUrl = undefined;
var imjoy_loaded_state = false;
const validate_message = event_data => {
  if (typeof event_data === 'string') {
    try {
      event_data_json = JSON.parse(event_data);
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
}

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
      event_data_json = JSON.parse(event.data);

      // load function name and args from event.data
      var fn_name = event_data_json.fn_name;
      var args = event_data_json.args;
      // call the function
      console.log('checking if function ' + fn_name + ' exists');
      if (fn_name in window) {
        console.log('exists! calling function ' + fn_name);
        let fn_output_string = window[fn_name](args);
        let response_string = JSON.stringify({
          input: event.data,
          ret_json_string: fn_output_string,
        });
        console.log('function called');
        console.log('return length: ' + response_string.length);
        window.ReactNativeWebView.postMessage(response_string);
      } else {
        console.log('function ' + fn_name + ' does not exist');
      }
    },
    false,
);

function test_fn(args) {
  console.log('test_fn called');
  console.log('args: ' + args);
  return JSON.stringify({a: 1, b: 2});
}

function convert_b64_to_bytes(b64_string) {
  console.log('TRYING TO CONVERT B64 TO BYTES');
  var byte_string = atob(b64_string);
  var len = byte_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = byte_string.charCodeAt(i);
  }
  return bytes;
}

function convert_bytes_to_b64(bytes) {
  console.log("TRYING TO CONVERT BYTES TO B64")
  var b64_string = btoa(String.fromCharCode.apply(null, bytes));
  return b64_string;
}

function load_image_from_b64(b64_string) {
  bytes = convert_b64_to_bytes(b64_string);
  cheerpjAddStringFile("/str/custom_file_lol.jpg", bytes)
  ij.open("/str/custom_file_lol.jpg")
  console.log('IMAGE OPENED');
}
function particle_analysis_macro() {
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

function get_image() {
  console.log('GETTING IMAGE');
  imp_custom = ij.getImage();
  res_uint8 = ij.saveAsBytes(imp_custom, "png");
  res_b64 = convert_bytes_to_b64(res_uint8);
  return res_b64;
}

// setTimeout(function () {
//           window.ReactNativeWebView.postMessage("Hello!")
//           alert("hello 2");
//         }, 2000)
// setTimeout(async function () {
//           window.ReactNativeWebView.postMessage("Hello!")
//           // alert(ij);
//           ij.runMacro('run("Blobs (25K)");');
//           // console.log("printing image")
//           // a = ij.getImage()
//           // console.log(imp)
//           // var pxls = await ij.getPixels(imp)
//           // console.log(pxls)
//           // window.ReactNativeWebView.postMessage(JSON.stringify(pxls))
//         }, 8000)
//
//          setTimeout(function () {
//             a = ij.getImage()
//             a.then((imp)=>{
//                 console.log("image get")
//                 window.ReactNativeWebView.postMessage(JSON.stringify(ij.getPixels(a).value))
//                 })
//
//         }, 12000)
