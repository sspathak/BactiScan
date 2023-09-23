import React, {useContext, useRef, useState} from 'react';
import WebView from 'react-native-webview';
import RNFetchBlob from 'rn-fetch-blob';
import {ActivityIndicator, Button, Text, View} from 'react-native';
// import getParticleCountData from '../scan_viewer/ScanViewer';
// import App from '../../App';
import AppContext from '../AppContext';

var RNFS = require('react-native-fs');
var file_bytes: any;
var load_ended_state = false;
var injectJS = '';
//ResultsTable = await cjResolveCall("ij.WindowManager", "getIDList", null);
// getWindow = await cjResolveCall("ij.WindowManager", "getWindow", ['java.lang.String']);

const jsCode = `
console.log('hello');
// var cjResolveCall = undefined;
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
          return: fn_output_string,
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

async function init_ij(args) {
  console.log('INIT IJ CALLED');
  // wait till ij is not undefined
  while (typeof ij === 'undefined') {
    console.log('waiting for ij to load');
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('ij is loaded');
  return JSON.stringify({status: 'success'});
}

function load_image_from_b64(b64_string) {
  bytes = convert_b64_to_bytes(b64_string);
  cheerpjAddStringFile('/str/custom_file.jpg', bytes);
  ij.open('/str/custom_file.jpg');
  console.log('IMAGE OPENED');
  return JSON.stringify({status: 'success'});
}

async function apply_bandpass_filter(_args) {
  args = JSON.parse(_args);
  console.log('APPLYING BANDPASS FILTER');
  ij.runMacro(\`run("Bandpass Filter...", "filter_large=\${args[1]} filter_small=\${args[0]} suppress=None tolerance=5 autoscale saturate");
  setOption("WaitForCompletion", true);
  \`);
  let get_image = await cjResolveCall("ij.WindowManager", "getCurrentImage");
  let in_proc = await get_image()
  while (in_proc.locked9 === 1) {
    console.log('waiting for bandpass to finish');
    in_proc = await get_image()
  }
  // window.ReactNativeWebView.postMessage(JSON.stringify({
  //   input: JSON.stringify({fn_name: 'print', args: {success: 'success'}}),
  //   return: JSON.stringify({status: 'whaaaaat'}),
  // }));
  return JSON.stringify({status: 'success'});
};


async function equalize_histogram() {
  console.log('EQUALIZING HISTOGRAM');
  let get_image = await cjResolveCall("ij.WindowManager", "getCurrentImage");
  let in_proc = await get_image()
  while (in_proc.locked9 === 1) {
    console.log('waiting for bandpass to finish');
    in_proc = await get_image()
  }
  ij.runMacro(\`run("Enhance Contrast...", "saturated=50 equalize");;
  setOption("WaitForCompletion", true);
  \`);
  return JSON.stringify({status: 'success'});
};

async function convert_image_to_8bit() {
  let get_image = await cjResolveCall("ij.WindowManager", "getCurrentImage");
  let in_proc = await get_image()
  while (in_proc.locked9 === 1) {
    console.log('waiting for bandpass to finish');
    in_proc = await get_image()
  }
  console.log('CONVERTING TO 8BIT');
  ij.runMacro('run("8-bit");');
  return JSON.stringify({status: 'success'});
}

async function save_image_as(n) {
  let get_image = await cjResolveCall("ij.WindowManager", "getCurrentImage");
  let in_proc = await get_image()
  while (in_proc.locked9 === 1) {
    console.log('waiting for bandpass to finish');
    in_proc = await get_image()
  }
  console.log('SAVING IMAGE');
  get_image_n(n);
  return JSON.stringify({status: 'success'});
}

async function get_image_n(n) {
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
      let fn_output_string = reader.result.split(',')[1];
      let response_string = JSON.stringify({
        input: JSON.stringify({fn_name: 'save_image_as', args: {n: n}}),
        return: JSON.stringify({
          image: fn_output_string,
          n: n,
        }),
      });
      console.log('function called');
      console.log('return length: ' + response_string.length);
      window.ReactNativeWebView.postMessage(response_string);
    };
    reader.readAsDataURL(blob);
  } catch (error) {
    console.log('Error fetching or reading image data:', error);
    return JSON.stringify({status: 'fail'});
  }
  return JSON.stringify({status: 'success'});
}

function apply_threshold(_args) {
  args = JSON.parse(_args);
  console.log('APPLYING THRESHOLD');
  ij.runMacro(\`setAutoThreshold("Default");
 setThreshold(\${args[0]}, \${args[1]});
setOption("BlackBackground", false);
\`);
  return JSON.stringify({status: 'success'});
}

function apply_mask() {
  console.log('APPLYING MASK');
  ij.runMacro(\`run("Convert to Mask");
\`);
  return JSON.stringify({status: 'success'});
}

function analyze_particles(_args) {
  args = JSON.parse(_args);
  console.log('ANALYZING PARTICLES');
  ij.runMacro(\`run("Analyze Particles...", "size=\${args[0]}-\${args[1]} show=Overlay summarize");
\`);
  return JSON.stringify({status: 'success'});
}
var get_window =  null;
var summary_window = null;
async function get_particle_count() {
  console.log('GETTING PARTICLE COUNT');
  // wait for 500ms to make sure the particle count is updated
  setTimeout(function () {
    console.log('500ms passed');
  }, 500);
  await cjResolveCall("ij.WindowManager", "getWindow", ['java.lang.String']).then(async function (gw) {
    get_window = gw;
    await get_window('Summary').then(async function (window1) {
      summary_window = window1;
      while (!summary_window) {
        summary_window = await get_window('Summary');
        console.log('waiting for summary_window.component60 to load', summary_window);
        await new Promise(r => setTimeout(r, 1000));
      }
      let particle_count = summary_window.component60.elementData1.at(1).rt111.columns6.at(2)[1];
      let response_string = JSON.stringify({
        input: JSON.stringify({fn_name: 'get_particle_count_final', args: {particle_count: String(particle_count)}}),
        return: JSON.stringify({
          particle_count: String(particle_count),
        }),
      });
      console.log('sending response ' + response_string);
      window.ReactNativeWebView.postMessage(response_string);
    });
  });  
  return JSON.stringify({particle_count: String(-1)});
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
  return JSON.stringify({status: 'success'});
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
      let fn_output_string = reader.result.split(',')[1];
      let response_string = JSON.stringify({
        input: JSON.stringify({fn_name: 'get_image', args: {success: 'success'}}),
        return: fn_output_string,
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
// RNFS.readFile(
//   `${RNFS.MainBundlePath}/views/imagej_webview/webview_rpc_enabler.txt`,
//   'utf8',
// ).then((contents: any) => {
//   console.warn('contents: ', contents);
//   injectJS = contents;
//   return injectJS;
// });

const image_at_path_to_b64 = (path: string) => {
  console.log('TRYING TO READ FILE RNFS at path: ', path);
  return RNFS.readFile(path, 'base64');
};

interface CustomWebViewProps {
  getParticleCountData: () => Promise<string[] | any[]>;
}

const CustomWebView = ({
  source_image_path,
  setParticleCount,
  results_ready,
  setResultsReady,
  getParticleCountData,
}) => {
  console.log('source_image_path: ', source_image_path);
  const webviewRef = useRef<WebView | null>(null);
  const [IJLoaded, setIJLoaded] = useState(false);
  const particleCountParams = useContext(AppContext);
  console.log(
    `using params: ${particleCountParams.global_lower_threshold}, ${particleCountParams.global_upper_threshold}, ${particleCountParams.global_lower_size}, ${particleCountParams.global_upper_size}`,
  );
  const send_InitIJ = async () => {
    console.log('send_InitIJ');
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'init_ij', args: 'test args'}),
    );
  };

  const receive_InitIJ = async (data: any) => {
    console.log('receive_InitIJ');
    console.log('data: ', data);
    setIJLoaded(true);
    await send_LoadImage();
  };

  const receive_print = async (data: any) => {
    console.log('receive_print');
    console.log('data: ', data);
  };

  const send_LoadImage = async () => {
    console.log('send_LoadImage');
    let image_b64 = await image_at_path_to_b64(`${source_image_path}`);
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'load_image_from_b64', args: image_b64}),
    );
  };

  const receive_LoadImage = async (data: any) => {
    console.log('receive_LoadImage');
    console.log('data: ', data);
    // await send_ApplyBandpassFilter();
    // await send_EqualizeHistogram();
    await send_ConvertImageTo8Bit();
  };
  const send_ApplyBandpassFilter = async () => {
    console.log('send_ApplyBandpassFilter');
    webviewRef.current?.postMessage(
      JSON.stringify({
        fn_name: 'apply_bandpass_filter',
        args: `[${particleCountParams.global_lower_bandpass}, ${particleCountParams.global_upper_bandpass}]`,
      }),
    );
  };
  const receive_ApplyBandpassFilter = async (data: any) => {
    console.log('receive_ApplyBandpassFilter');
    console.log('data: ', data);
    // await send_EqualizeHistogram();
    // await send_ConvertImageTo8Bit();
    // await send_EqualizeHistogram();
    await send_SaveImageAs('1.png');
  };
  const send_EqualizeHistogram = async () => {
    console.log('send_EqualizeHistogram');
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'equalize_histogram', args: ''}),
    );
  };
  const receive_EqualizeHistogram = async (data: any) => {
    console.log('receive_EqualizeHistogram');
    console.log('data: ', data);
    // await send_ConvertImageTo8Bit();
    // await send_ApplyBandpassFilter();
    // await send_SaveImageAs('1.png');
  };
  const send_ConvertImageTo8Bit = async () => {
    console.log('send_ConvertImageTo8Bit');
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'convert_image_to_8bit', args: ''}),
    );
  };

  const receive_ConvertImageTo8Bit = async (data: any) => {
    console.log('receive_ConvertImageTo8Bit');
    console.log('data: ', data);
    // sleep for 1s for bandpass to finish
    // await new Promise(r => setTimeout(r, 2000));
    // await send_SaveImageAs('1.png');
    await send_ApplyBandpassFilter();
  };

  const send_SaveImageAs = async (save_filename: string) => {
    console.log('send_SaveImageAs');
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'save_image_as', args: '1'}),
    );
  };

  const receive_SaveImageAs = async (data: any) => {
    console.log('receive_SaveImageAs');
    await saveDataFromBase64(
      data,
      `${source_image_path.split('/').slice(0, -1).join('/')}`,
      '1.png',
    ).then(() => {
      console.log(
        'FILE WRITTEN FROM URL----receive_SaveImageAs--------------------------',
      );
    });
    await send_ApplyThreshold();
  };

  const send_ApplyThreshold = async () => {
    console.log('send_ApplyThreshold');
    webviewRef.current?.postMessage(
      JSON.stringify({
        fn_name: 'apply_threshold',
        args: `[${particleCountParams.global_lower_threshold}, ${particleCountParams.global_upper_threshold}]`,
      }),
    );
  };

  const receive_ApplyThreshold = async (data: any) => {
    console.log('receive_ApplyThreshold');
    console.log('data: ', data);
    await send_ApplyMask();
  };

  const send_ApplyMask = async () => {
    console.log('send_ApplyMask');
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'apply_mask', args: ''}),
    );
  };

  const receive_ApplyMask = async (data: any) => {
    console.log('receive_ApplyMask');
    console.log('data: ', data);
    await send_SaveImageAs2('2.png');
  };

  const send_SaveImageAs2 = async (save_filename: string) => {
    console.log('send_SaveImageAs2');
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'save_image_as', args: '2'}),
    );
  };

  const receive_SaveImageAs2 = async (data: any) => {
    console.log('receive_SaveImageAs2');
    await saveDataFromBase64(
      data,
      `${source_image_path.split('/').slice(0, -1).join('/')}`,
      '2.png',
    ).then(() => {
      console.log(
        'FILE WRITTEN FROM URL----receive_SaveImageAs2--------------------------',
      );
    });
    await send_AnalyzeParticles();
  };

  const send_AnalyzeParticles = async () => {
    console.log('send_AnalyzeParticles');
    webviewRef.current?.postMessage(
      JSON.stringify({
        fn_name: 'analyze_particles',
        args: `[${particleCountParams.global_lower_size}, ${particleCountParams.global_upper_size}]`,
      }),
    );
  };

  const receive_AnalyzeParticles = async (data: any) => {
    console.log('receive_AnalyzeParticles');
    console.log('data: ', data);
    await send_getParticleCount();
  };

  const send_getParticleCount = async () => {
    console.log('send_getParticleCount');
    // N2ij13WindowManager.nonImageList3.elementData1.at(1).component60.elementData1.at(1).rt111
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'get_particle_count', args: ''}),
    );
  };

  const receive_GetParticleCount = async (data: any) => {
    console.log('receive_getParticleCount');
    console.log('data: ', data);
    // setParticleCount(JSON.parse(data).particle_count);
    data
      ? await update_metadata_particle_count(data.particle_count)
      : console.log('no data');
    await send_SaveImageAs3('3.png');
  };

  const send_SaveImageAs3 = async (save_filename: string) => {
    console.log('send_SaveImageAs3');
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'save_image_as', args: '3'}),
    );
  };

  const receive_SaveImageAs3 = async (data: any) => {
    console.log('receive_SaveImageAs3');
    await saveDataFromBase64(
      data,
      `${source_image_path.split('/').slice(0, -1).join('/')}`,
      '3.png',
    ).then(() => {
      setResultsReady(true);
      getParticleCountData();
      console.log(
        'FILE WRITTEN FROM URL----receive_SaveImageAs3--------------------------',
      );
    });
  };

  const saveDataFromBase64 = async (base64Data, directoryPath, fileName) => {
    try {
      console.log('Saving file...');
      const filePath = `${directoryPath}/${fileName}`;
      await RNFetchBlob.fs.writeFile(filePath, base64Data, 'base64');
    } catch (error) {
      console.log('Error saving file:', error);
    }
  };

  /*
  save_image_n is a function that saves an image to the device
   */
  const save_image_n = async args => {
    let image_b64 = args.image_b64;
    let image_name = args.n + '.png';
    await saveDataFromBase64(
      image_b64,
      `${source_image_path.split('/').slice(0, -1).join('/')}`,
      image_name,
    );
  };

  // Updates the metadata file located in the same directory as the source image with the particle count
  const update_metadata_particle_count = async args => {
    let metadata_path =
      `${source_image_path.split('/').slice(0, -1).join('/')}` +
      '/metadata.json';
    let _metadata = await RNFetchBlob.fs.readFile(metadata_path, 'utf8');
    _metadata = JSON.parse(_metadata);
    _metadata.particle_count = args;
    _metadata = JSON.stringify(_metadata);
    await RNFetchBlob.fs.writeFile(metadata_path, _metadata, 'utf8');
    console.log('metadata updated with ' + _metadata + ' metadata');
  };

  // updates the particleCount hook with the number in the args
  // const set_particle_count = async (args) => {
  //   particle_count = args.particle_count;
  //   setParticleCount(args.particle_count);
  // };
  // }

  // const callback_function_list = {
  //   test_fn: test_fn,
  //   save_image_n: save_image_n,
  //   set_particle_count: set_particle_count,
  // }

  const onMessage = async (message: any) => {
    console.log('onMessage');
    console.log(
      'Received message: ',
      message.nativeEvent.data.slice(0, 100) +
        '...' +
        message.nativeEvent.data.slice(-100),
    );
    try {
      let webview_reply = JSON.parse(message.nativeEvent.data);
      let inp_fn_name = JSON.parse(webview_reply.input).fn_name;
      let inp_fn_args = JSON.parse(webview_reply.input).args;
      let inp_fn_return = JSON.parse(webview_reply.return);
      console.log(
        'successfull parsed webview_reply, inp_fn_name, inp_fn_args, inp_fn_return',
      );
      console.log(
        `inp_fn_name: ${inp_fn_name}, inp_fn_args: ${JSON.stringify(
          inp_fn_args,
        ).slice(0, 100)}, inp_fn_return: ${JSON.stringify(inp_fn_return).slice(
          0,
          100,
        )}`,
      );
      if (JSON.parse(webview_reply.input).fn_name === 'test_fn') {
        if (JSON.parse(webview_reply.args).a === 1) {
          console.log('success!');
        } else {
          console.warn('invalid return value received from webview');
        }
      }
      if (JSON.parse(webview_reply.input).fn_name === 'load_image_1') {
        console.log('calling load_image_1');
        console.log(
          'Received message: ',
          message.nativeEvent.data.slice(0, 100),
        );
        await saveDataFromBase64(
          webview_reply.args,
          `${source_image_path.split('/').slice(0, -1).join('/')}`,
          '3.png',
        ).then(() => {
          console.log('FILE WRITTEN FROM URL------------------------------');
        });
      }
      let fn_name = JSON.parse(webview_reply.input).fn_name;
      let args = JSON.parse(webview_reply.return);
      if (fn_name === 'init_ij') {
        await receive_InitIJ(args);
      } else if (fn_name === 'load_image_from_b64') {
        await receive_LoadImage(args);
      } else if (fn_name === 'apply_bandpass_filter') {
        await receive_ApplyBandpassFilter(args);
      } else if (fn_name === 'equalize_histogram') {
        await receive_EqualizeHistogram(args);
      } else if (fn_name === 'convert_image_to_8bit') {
        await receive_ConvertImageTo8Bit(args);
      } else if (fn_name === 'save_image_as') {
        if (args.n === '1') {
          await receive_SaveImageAs(args.image);
        } else if (args.n === '2') {
          await receive_SaveImageAs2(args.image);
        } else if (args.n === '3') {
          await receive_SaveImageAs3(args.image);
        }
      } else if (fn_name === 'apply_threshold') {
        await receive_ApplyThreshold(args);
      } else if (fn_name === 'apply_mask') {
        await receive_ApplyMask(args);
      } else if (fn_name === 'analyze_particles') {
        await receive_AnalyzeParticles(args);
      } else if (fn_name === 'get_particle_count_final') {
        await receive_GetParticleCount(args);
      } else if (fn_name === 'print') {
        await receive_print(args);
      } else {
        console.log('invalid fn_name received from webview');
      }
    } catch (e) {
      console.warn('catch@@');
      // console.warn(
      //   'error parsing message: ' + 'Received message: ',
      //   message.nativeEvent.data.slice(0, 100) +
      //     '...' +
      //     message.nativeEvent.data.slice(-100),
      // );
      console.log('received message' + message.nativeEvent);
      console.warn(e);
    }
  };

  // button to trigger onloaend
  const load_trigger = () => {
    load_ended_state = false;
    setResultsReady(false);
    send_InitIJ();
  };
  const triggerOnLoadEnd = () => {
    load_ended_state = false;
    // onLoadEnd();
    send_InitIJ();
  };

  return (
    <>
      {/*<Button title="Restart " onPress={load_trigger} />*/}

      {/*render webview if results ready is false*/}
      {!results_ready ? (
        <View
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: 100,
          }}>
          <View
            style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: 100,
            }}>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
              }}>
              <Text>Processing image...</Text>
              <ActivityIndicator />
            </View>
          </View>
          <WebView
            ref={webviewRef}
            source={{
              // uri: 'https://google.com',
              uri: 'https://ij.imjoy.io/',
            }}
            style={{
              marginTop: 0,
              width: '100%',
              height: '50%',
              backgroundColor: 'red',
            }}
            scalesPageToFit={true}
            containerStyle={[{flex: 0, width: '90%', height: '90%'}]}
            originWhitelist={['*']}
            // injectedJavaScript={jsCode}
            injectedJavaScriptBeforeContentLoaded={jsCode}
            javaScriptEnabled={true}
            onMessage={onMessage}
            onLoadEnd={triggerOnLoadEnd}
          />
        </View>
      ) : (
        <></>
      )}
    </>
  );
};

export default CustomWebView;
