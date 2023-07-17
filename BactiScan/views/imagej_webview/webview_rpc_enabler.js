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
  cheerpjAddStringFile('/str/custom_file_lol.jpg', bytes);
  ij.open('/str/custom_file_lol.jpg');
  console.log('IMAGE OPENED');
  return JSON.stringify({status: 'success'});
}

function convert_image_to_8bit() {
  console.log('CONVERTING TO 8BIT');
  ij.runMacro('run("8-bit");');
  return JSON.stringify({status: 'success'});
}

function save_image_as(n) {
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

function apply_threshold() {
  console.log('APPLYING THRESHOLD');
  ij.runMacro(`setAutoThreshold("Default");
setOption("BlackBackground", false);
`);
  return JSON.stringify({status: 'success'});
}

function apply_mask() {
  console.log('APPLYING MASK');
  ij.runMacro(`run("Convert to Mask");
`);
  return JSON.stringify({status: 'success'});
}

function analyze_particles() {
  console.log('ANALYZING PARTICLES');
  ij.runMacro(`run("Analyze Particles...", "size=500-Infinity show=Overlay summarize");
`);
  return JSON.stringify({status: 'success'});
}

function get_particle_count() {
  console.log('GETTING PARTICLE COUNT');
  // wait for 500ms to make sure the particle count is updated
  setTimeout(function () {
    console.log('500ms passed');
  }, 500);
  let particle_count = N2ij13WindowManager.nonImageList3.elementData1.at(1).component60.elementData1.at(1).rt111.columns6.at(2)[1]
  return JSON.stringify(particle_count);
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
