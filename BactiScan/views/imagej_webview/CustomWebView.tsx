import React, {useRef} from 'react';
import WebView from 'react-native-webview';
import RNFetchBlob from "rn-fetch-blob";
import { Platform } from 'react-native';

function atou(b64) {
  return decodeURIComponent(escape(atob(b64)));
}
function utoa(data) {
  return btoa(unescape(encodeURIComponent(data)));
}

var RNFS = require('react-native-fs');
var file_bytes: any;
var load_ended_state = false;
RNFS.readFile(`${RNFS.DocumentDirectoryPath}/test_img/image.jpg`).then(
  (contents: any) => {
    file_bytes = contents;
    console.log('File read!');
  },
);

const html = `<script src="https://lib.imjoy.io/imjoy-loader.js"></script>
<script>
alert('Loading ImJoy Core...')
loadImJoyCore().then((imjoyCore)=>{
    const imjoy = new imjoyCore.ImJoy({
//         imjoy_api: {},
//         //imjoy config
    })
    alert('Starting ImJoy Core...')
//     imjoy.start({workspace: 'default'}).then(()=>{
//         imjoy.alert('ImJoy Core started successfully!')
//     })
//     imjy.alert('ImJoy Core loaded successfully!')
})
// imjoy.log('Hello from ImJoy')
</script>
    
 `;

const imjrpc = `<script src="https://lib.imjoy.io/imjoy-loader.js"></script>
<script>
loadImJoyRPC().then(async (imjoyRPC)=>{
    const api = await imjoyRPC.setupRPC({name: 'My Awesome App'});
    function setup(){
        api.alert('ImJoy RPC initialized.')
    }
    // define your api which can be called by other plugins in ImJoy
    function my_api_func(){

    }
    // Importantly, you need to call \`api.export(...)\` in order to expose the api for your web application
    api.export({'setup': setup, 'my_api_func': my_api_func});
})
</script>`;

const requirejs = `<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>
<script>
require.config({
    paths: {
        'imjoyLoader': 'https://lib.imjoy.io/imjoy-loader',
    }
});

require(["imjoyLoader"], function (imjoyLoder) {
    // imjoyLoder.loadImJoyRPC().then(async (imjoyRPC) => {
    //     const api = await imjoyRPC.setupRPC({name: 'My Awesome App'});
    //     api.alert('ImJoy RPC initialized.')
    // })
    imjoyLoder.loadImJoyCore().then(async (imjoyCore) => {
        const imjoy = new imjoyCore.ImJoy({
            // imjoy_api: {},
            //imjoy config
        })
        imjoy.start({workspace: 'default'}).then(()=>{
            imjoy.alert('ImJoy Core started successfully!')
        })
        
        
    })
})
</script>`;

const basicapp = `<script src="https://lib.imjoy.io/imjoy-loader.js"></script>

    <div id="window-container"></div>
    <div id="menu-container"></div>
   <script>
loadImJoyBasicApp({
    process_url_query: true,
    show_window_title: false,
    show_progress_bar: true,
    show_empty_window: true,
    menu_style: { position: "absolute", right: 0, top: "2px" },
    window_style: {width: '100%', height: '100%'},
    main_container: null,
    menu_container: "menu-container",
    window_manager_container: "window-container",
    imjoy_api: { } // override some imjoy API functions here
}).then(async app => {
    // get the api object from the root plugin
    const api = app.imjoy.api;
    // if you want to let users to load new plugins, add a menu item
    app.addMenuItem({
        label: "➕ Load Plugin",
        callback() {
        const uri = prompt(
            \`Please type a ImJoy plugin URL\`,
            "https://github.com/imjoy-team/imjoy-plugins/blob/master/repository/ImageAnnotator.imjoy.html"
        );
        if (uri) app.loadPlugin(uri);
        },
    });

    // if you want a windows displayed in a draggable rezisable grid layout
    const grid = await api.createWindow({
        src: "https://grid.imjoy.io/#/app",
        name: "Grid",
    });
    // you can show windows in the grid
    const viewer = await grid.createWindow({ src: "https://kaibu.org" });

    // or display a message
    await api.showMessage("This is a message");
    // or progress
    await api.showProgress(50);
});</script>
`;


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

function StringToArrayBuffer2(string) {
  return StringToUint8Array(string).buffer;
}

function StringToArrayBuffer(string) {
  var binary = StringToBinary(string);
  var length = binary.length;
  var buffer = new ArrayBuffer(length);
  var view = new Uint8Array(buffer);

  for (var i = 0; i < length; i++) {
    view[i] = binary.charCodeAt(i);
  }

  return buffer;
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


function convert_utf8_to_bytes(utf8_string) {
  return new TextEncoder().encode(utf8_string);
}
function convert_b64_to_bytes(b64_string) {
  console.log('TRYING TO CONVERT B64 TO BYTES');
  var bytes = atob(b64_string);
  return bytes;
}

function convert_bytes_to_b64(bytes) {
  console.log('TRYING TO CONVERT BYTES TO B64');
  console.log('bytes length: ' + bytes.length);
  // var b64_string = btoa(String.fromCharCode.apply(null, bytes));
  // above line gives error: Maximum call stack size exceeded
  // so we do it in chunks
  var b64_string = '';
  var chunk_size = 1024;
  var num_chunks = Math.ceil(bytes.length / chunk_size);
  for (var i = 0; i < num_chunks; i++) {
    var start = i * chunk_size;
    var end = Math.min((i + 1) * chunk_size, bytes.length);
    var chunk = bytes.slice(start, end);
    b64_string += btoa(String.fromCharCode.apply(null, chunk));
  }
  return b64_string;
}


const image_at_path_to_b64 = (path: string) => {
  console.log('TRYING TO READ FILE RNFS');
  return RNFS.readFile(path, 'base64');
};

const CustomWebView = () => {
  const jsCode = `
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
  ij.runMacro(\`run("8-bit");
setAutoThreshold("Default");
////run("Threshold...");
setThreshold(56, 182);
////setThreshold(56, 182);
setOption("BlackBackground", false);
run("Convert to Mask");
run("Analyze Particles...", "size=500-Infinity show=Overlay");
\`);
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
  

async function get_image3() {
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


  `;
  const webviewRef = useRef<WebView | null>(null);
  // const [webviewRef, setWebviewRef] = useState(null);


  const onLoadEnd = async () => {
    if (load_ended_state) {
      return;
    }
    load_ended_state = true;
    // if (webviewRef.current) {
    console.log('onLoadEnd');
    // run test function
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'test_fn', args: 'test args'}),
    );

    // load image
    let fn_call_message = JSON.stringify({
      fn_name: 'load_image_from_b64',
      args: await image_at_path_to_b64(
        `${RNFS.DocumentDirectoryPath}/test_img/image.jpg`,
      ),
    });
    webviewRef.current?.postMessage(fn_call_message);

    let particle_analysis_macro_message = JSON.stringify({
      fn_name: 'particle_analysis_macro',
      args: '',
    });
    // post message after 5 seconds
    setTimeout(() => {
      // webviewRef.current?.postMessage(particle_analysis_macro_message);
    }, 9000);
    // webviewRef.current?.postMessage(particle_analysis_macro_message);

    let get_image_message = JSON.stringify({
      fn_name: 'get_image',
      args: '',
    });
    // post message after 5 seconds
    setTimeout(() => {
      webviewRef.current?.postMessage(get_image_message);
    }, 9000);
    // webviewRef.current?.postMessage(get_image_message);
    // }
  };
  const fetchBlobData = async (url) => {
    try {
      const response = await RNFetchBlob.fetch('GET', url);
      const blob = response.blob();

      // Do something with the blob
      console.log(blob);
    } catch (error) {
      console.log('Error fetching blob data:', error);
    }
  };
  const saveDataFromURL = async (url, directoryPath, fileName) => {
    try {
      console.log('Saving file...');
      // Create the directory if it doesn't exist
      // await RNFetchBlob.fs.mkdir(directoryPath);
      console.log('Extracting data... from ' + url);
      // Convert data URL to Blob
      const response = await RNFetchBlob.config({
        fileCache: true,
        appendExt: 'blob',
      }).fetch('GET', url);

      console.log('Writing file...');
      // Determine the file path based on the platform
      const filePath = `${directoryPath}/${fileName}`;

      // Write the Blob to a file
      await RNFetchBlob.fs.writeFile(filePath, response.data, 'base64');

      console.log('File saved successfully.');
    } catch (error) {
      console.log('Error saving file:', error);
    }
  };




  const saveDataFromBase64 = async (base64Data, directoryPath, fileName) => {
    try {
      console.log('Saving file...');
      // Create the directory if it doesn't exist
      // await RNFetchBlob.fs.mkdir(directoryPath);
      console.log('Writing file...');
      // Determine the file path based on the platform
      const filePath = `${directoryPath}/${fileName}`;
      console.log('input length: ' + base64Data.length);
      console.log('input:' + base64Data);
      //decode as b64 then read as utf8 and encode as b64
      let utf8Data = new TextDecoder().decode(base64Data);
      console.log('utf8 length: ' + utf8Data.length);
      console.log('utf8:' + utf8Data);
      utf8Data = atob(base64Data);
      console.log('utf8 length: ' + utf8Data.length);
      console.log('utf8:' + utf8Data);
      utf8Data = base64Data;



      // Convert base64 to binary data
      // const bytes = RNFetchBlob.base64.decode(utf8Data);

      // Write the binary data to a file
      await RNFetchBlob.fs.writeFile(filePath, utf8Data, 'base64');

      console.log('File saved successfully.');
    } catch (error) {
      console.log('Error saving file:', error);
    }
  };
  const onMessage = async (message: any) => {
    // console.log('Received message: ', message.nativeEvent.data);
    try {
      let webview_reply = JSON.parse(message.nativeEvent.data);
      if (JSON.parse(webview_reply.input).fn_name === 'test_fn') {
        if (JSON.parse(webview_reply.ret_json_string).a === 1) {
          console.log('success!');
        } else {
          console.log('invalid return value received from webview');
        }
      }
      if (JSON.parse(webview_reply.input).fn_name === 'get_image') {
        console.log('RECEIVED get_image RESPONSE');
        console.log('Received message: ', message.nativeEvent.data.slice(0, 100));
        // let b64_string = JSON.parse(
        //   webview_reply.ret_json_string,
        // ).fn_output_string;
        // let utf8_string = webview_reply.ret_json_string;
        // let utf8_string = StringToArrayBuffer(webview_reply.ret_json_string);
        // console.log(
        //   'webview_reply.ret_json_string = ' + webview_reply.ret_json_string,
        // );
        // let bytes = convert_utf8_to_bytes(utf8_string);
        // let bytes = convert_bytes_to_b64(bytess);
        // let bytes = convert_b64_to_bytes(utf8_string);
        // let bytes = Int8Array.from(JSON.parse(utf8_string));
        // console.log("length of bytes = " + bytes.length)
        // let bytes = JSON.parse(utf8_string);
        let image_path = `${RNFS.DocumentDirectoryPath}/test_img/particle_analysis_macro.png`;
        console.log('WRITING FILE RNFS');
        // try {
        //   // await RNFS.writeFile(image_path, bytes, 'base64').promise;
        //   await RNFetchBlob.fs.writeFile(
        //     image_path,
        //     webview_reply.ret_json_string,
        //     'base64',
        //   );
        //   console.log('FILE WRITTEN RNFS');
        // } catch (e) {
        //   console.log('error writing file');
        //   console.log(e);
        // }
        console.log('WRITING DATA FROM URL');
        console.log('webview_reply =:' + message.nativeEvent.data.slice(0, 100));
        await saveDataFromBase64(
          webview_reply.ret_json_string,
          `${RNFS.DocumentDirectoryPath}/test_img`,
          'particle_analysis_macro.png',
        ).then(() => {
          console.log('FILE WRITTEN FROM URL------------------------------');
        });
        // await saveDataFromURL(
        //   webview_reply.ret_json_string,
        //   `${RNFS.DocumentDirectoryPath}/test_img`,
        //   'particle_analysis_macro.png',
        // );
        // console.log('DATA WRITTEN FROM URL');
      }
    } catch (e) {
      console.log('error parsing message');
      console.log(e);
    }
  };

  return (
    <WebView
      ref={webviewRef}
      source={{
        // uri: 'https://google.com',
        uri: 'https://ij.imjoy.io/',
        // html: basicapp,
      }}
      style={{
        marginTop: 20,
        width: 300,
        height: 300,
        backgroundColor: 'red',
      }}
      originWhitelist={['*']}
      // injectedJavaScript={jsCode}
      injectedJavaScriptBeforeContentLoaded={jsCode}
      javaScriptEnabled={true}
      // onMessage={event => {
      //   console.log('got message = ' + event.nativeEvent.data);
      // }}
      onMessage={onMessage}
      onLoadEnd={onLoadEnd}
    />
  );
};

export default CustomWebView;
