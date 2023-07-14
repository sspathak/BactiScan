import React, {useRef} from 'react';
import WebView from 'react-native-webview';

var RNFS = require('react-native-fs');
var file_bytes: any;
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

const image_at_path_to_base64 = (path: string) => {
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



  `;
  const webviewRef = useRef<WebView | null>(null);
  // const [webviewRef, setWebviewRef] = useState(null);
  const onLoadEnd = async () => {
    // if (webviewRef.current) {
    console.log('onLoadEnd');
    // run test function
    webviewRef.current?.postMessage(
      JSON.stringify({fn_name: 'test_fn', args: 'test args'}),
    );

    // load image
    let fn_call_message = JSON.stringify({
      fn_name: 'load_image_from_b64',
      args: await image_at_path_to_base64(
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
      webviewRef.current?.postMessage(particle_analysis_macro_message);
    }, 15000);
    // webviewRef.current?.postMessage(particle_analysis_macro_message);

    let get_image_message = JSON.stringify({
      fn_name: 'get_image',
      args: '',
    });
    // post message after 5 seconds
    setTimeout(() => {
      webviewRef.current?.postMessage(get_image_message);
    }, 25000);
    // webviewRef.current?.postMessage(get_image_message);
    // }
  };

  const onMessage = (message: any) => {
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
      if (
        JSON.parse(webview_reply.input).fn_name === 'get_image'
      ) {
        console.log('RECEIVED get_image RESPONSE');
        let b64_string = JSON.parse(
          webview_reply.ret_json_string,
        ).ret_json_string;
        let bytes = convert_b64_to_bytes(b64_string);
        let image_path = `${RNFS.DocumentDirectoryPath}/test_img/particle_analysis_macro.jpg`;
        RNFS.writeFile(image_path, bytes, 'base64')
          .then(success => {
            console.log('FILE WRITTEN!');
            console.log(image_path);
          })
          .catch(err => {
            console.log(err.message);
          });
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
