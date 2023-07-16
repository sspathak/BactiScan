import React, {useEffect, useRef} from 'react';
import WebView from 'react-native-webview';
import RNFetchBlob from "rn-fetch-blob";
import {Button, Platform} from 'react-native';
import commonStyles from "../CommonStyles";

var RNFS = require('react-native-fs');
var file_bytes: any;
var load_ended_state = false;
// RNFS.readFile(`${RNFS.DocumentDirectoryPath}/test_img/image.jpg`).then(
//   (contents: any) => {
//     file_bytes = contents;
//     console.log('File read!');
//   },
// );


const processImageFlow = {
  'function': 'CheckIJLoaded',
  'args': JSON.stringify({'arg1': 'arg1_value'}),
  'callback': {
    'function': 'LoadImageIntoIJ',
    'args': JSON.stringify({'path': 'some path'}),
    'callback': {
      'function': 'ConvertImageTo8Bit',
      'args': JSON.stringify({'arg1': 'arg1_value'}),
      'callback': {
        'function': 'SaveImageAs',
        'args': JSON.stringify({'saveAs': '1.png'}),
        'callback': {
          'function': 'ApplyThreshold',
          'args': JSON.stringify({'arg1': 'arg1_value'}),
          'callback': {
            'function': 'ApplyMask',
            'args': JSON.stringify({'arg1': 'arg1_value'}),
            'callback': {
              'function': 'SaveImageAs',
              'args': JSON.stringify({'saveAs': '2.png'}),
              'callback': {
                'function': 'AnalyzeParticles',
                'args': JSON.stringify({'arg1': 'arg1_value'}),
              }
            }
          }

        }
      }
    }
  }
}

const image_at_path_to_b64 = (path: string) => {
  console.warn('TRYING TO READ FILE RNFS at path: ', path);
  return RNFS.readFile(path, 'base64');
};

const CustomWebView = ({source_image_path}) => {
  console.warn('source_image_path: ', source_image_path);
  const jsCode = `
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
  ij.runMacro(\`run("8-bit");
setAutoThreshold("Default");
////run("Threshold...");
setThreshold(56, 182);
////setThreshold(56, 182);
setOption("BlackBackground", false);
run("Convert to Mask");
run("Analyze Particles...", "size=500-Infinity show=Overlay");
\`);
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
      let response_string = JSON.stringify({
        input: JSON.stringify({fn_name: 'get_image'}),
        ret_json_string: fn_output_string,
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
  `;
  const webviewRef = useRef<WebView | null>(null);

  const initiateImageAnalysis = async () => {
    console.warn('initiateImageAnalysis');
    // call check IJ loaded with callback as load_image
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'WVCheckIJLoaded', args: '', callback: 'RNLoadImageN'}),
    );
  }

  const CheckIJLoaded = async () => {
    console.log('CheckIJLoaded');
    return new Promise((resolve, reject) => {
      webviewref.current?.postMessage(
        JSON.stringify({
          function: 'CheckIJLoaded',
          args: JSON.stringify({}),
        }),
      );
    });
  }
  const onLoadEnd = async () => {
    if (load_ended_state) {
      return;
    }
    load_ended_state = true;
    console.warn('onLoadEnd');
    // run test function
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'test_fn', args: 'test args'}),
    );

    // load image
    let fn_call_message = JSON.stringify({
      fn_name: 'load_image_from_b64',
      args: await image_at_path_to_b64(
        // `${RNFS.DocumentDirectoryPath}/test_img/image.jpg`,
        source_image_path,
      ),
    });
    console.warn("fn_call_message: " + fn_call_message.slice(0, 100) + "..." + fn_call_message.slice(-100))
    console.warn(webviewRef.current ? "webviewRef.current is not null" : "webviewRef.current is null")
    webviewRef.current?.postMessage(fn_call_message);

    let particle_analysis_macro_message = JSON.stringify({
      fn_name: 'particle_analysis_macro',
      args: '',
    });
    // post message after 5 seconds
    setTimeout(() => {
      webviewRef.current?.postMessage(particle_analysis_macro_message);
    }, 9000);
    // webviewRef.current?.postMessage(particle_analysis_macro_message);

    let get_image_message = JSON.stringify({
      fn_name: 'get_image',
      args: '',
    });
    // post message after 5 seconds
    setTimeout(() => {
      webviewRef.current?.postMessage(get_image_message);
    }, 14000);
    // webviewRef.current?.postMessage(get_image_message);
    // }
  };

  const saveDataFromBase64 = async (base64Data, directoryPath, fileName) => {
    try {
      console.warn('Saving file...');
      const filePath = `${directoryPath}/${fileName}`;
      await RNFetchBlob.fs.writeFile(filePath, base64Data, 'base64');
    } catch (error) {
      console.warn('Error saving file:', error);
    }
  };

  /*
  save_image_n is a function that saves an image to the device
   */
  const save_image_n = async (args) => {
    let image_b64 = args.image_b64;
    let image_name = args.n + '.png';
    await saveDataFromBase64(
      image_b64,
      `${source_image_path.split('/').slice(0, -1).join('/')}`,
      image_name,
    );
  };

  // updates the particleCount hook with the number in the args
  const set_particle_count = async (args) => {
    particle_count = args.particle_count;
    setParticleCount(args.particle_count);
  };
  }

  const callback_function_list = {
    test_fn: test_fn,
    save_image_n: save_image_n,
    set_particle_count: set_particle_count,
  }

  const onMessage = async (message: any) => {
    // console.log('Received message: ', message.nativeEvent.data);
    try {
      let webview_reply = JSON.parse(message.nativeEvent.data);
      if (JSON.parse(webview_reply.input).fn_name === 'test_fn') {
        if (JSON.parse(webview_reply.args).a === 1) {
          console.warn('success!');
        } else {
          console.warn('invalid return value received from webview');
        }
      }
      if (JSON.parse(webview_reply.input).fn_name === 'load_image_1') {
        console.warn('calling load_image_1');
        console.warn(
          'Received message: ',
          message.nativeEvent.data.slice(0, 100),
        );
        await saveDataFromBase64(
          webview_reply.args,
          `${source_image_path.split('/').slice(0, -1).join('/')}`,
          '3.png',
        ).then(() => {
          console.warn('FILE WRITTEN FROM URL------------------------------');
        });
      }
    } catch (e) {
      console.warn('error parsing message');
      console.warn(e);
    }
  };

  // button to trigger onloaend
  const triggerOnLoadEnd = () => {
    load_ended_state = false;
    onLoadEnd();
  };

  return (
    <><Button title="triggerOnLoadEnd" onPress={triggerOnLoadEnd}/><WebView
      ref={webviewRef}
      source={{
        // uri: 'https://google.com',
        uri: 'https://ij.imjoy.io/',
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
      onMessage={onMessage}
      onLoadEnd={onLoadEnd}/></>
  );
};

export default CustomWebView;
