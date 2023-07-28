# BactiScan

## Creation Instructions:

### Create React Native App
run command `npx react-native init BactiScan` to create a React native app

### Link project to GitHub
`git init` \
`git add .` \
`git commit -m "Add existing project files to Git"` \
`git remote add origin https://github.com/sspathak/BactiScan.git` \
`git push -u -f origin master` \


# Design Decisions:

## API:

[//]: # (Decided to go for webview based app. Some advantages of doing so include  - no need to have server running constantly, images are not sent to any external service and all computation happens on the device)

API provided by imjoy is a WASM based JavaScript port of the ImageJ Java API. It is a very powerful API and can be 
used to perform almost everything that ImageJ can do. \
The API uses CheerpJ to compile Java code to JavaScript. The best way to use the API is to refer to the Java documentation 
for ImageJ and then use the JavaScript API to perform the tasks by using CheerpJ's functions to run Java code. \


## Mobile App:

The app is built using React Native. The app uses a webview to load the imjoy API.

### Why webview?

I decided to use a webview for the app because the ImageJ.JS API does not have a React Native implementation. \
The other option was to use a server to run the API and then make calls to the server from the app. However, this would
require the server to be running constantly and would also require the images to be sent to the server. Furthermore, it 
wouldn't have made full use of the API as the API is very powerful and can be used to perform a lot of tasks and is 
designed to run in the browser. \


### Why React Native?

React Native is a cross platform framework that allows us to build native apps for both Android and iOS using JavaScript. \
It is a very powerful framework and is used by a lot of companies to build their apps. \
It is also very easy to use and has a lot of community support. \

### Communication between React Native and webview:

The communication between React Native and the webview is done using the `react-native-webview` library. Transferring 
data between the webview and React Native can be tricky. The `react-native-webview` library provides a `postMessage` 
function that can be used to send data from the webview to React Native. However, the `postMessage` function can only
send strings. To send objects, we need to use the `injectJavaScript` function. This function can be used to run
JavaScript code in the webview. We can use this function to run a function in the webview that can then use the
`postMessage` function to send the data to React Native. \

The `react-native-webview` library provides an `onMessage` function that can be used to listen for messages from
the webview. However, this function can only listen for strings. To listen for objects, we need to use the 
`onMessageReceived` function. This function can be used to run a function in the webview that can then use the
`postMessage` function to send the data to React Native. \

An RPC like design was chosen for the communication between React Native and the webview. At first, the react native
side injects a javascript function into the webview which listens for messages posted to the webview. Now we have 
essentially created a channel of communication capable of sending messages from react native and receiving messages on
the webview end. This funciton is designed in such a way that responses from the function are sent back to the webview 
using the "postMessage" function and the react native app listens for these messages using the "onMessageReceived" 
function. \


The documentation for the imjoy API is extensive but challenging to navigate. Furthermore, some of the early version of 
the API are very buggy. The API is available as a javascript module as well as a python package that you can simply pip install. 
However, I faced some challenges with using the Python API.

In this document I will be sharing what I think is the best way to use the imagej API.

Use functions provided by CheerpJ to call functions, create objects and perform all imageJ operations.
Start by creating list of classes and methods you will be needing from thhe original imageJ Java API. There is a lot more documentation for 
this API as compared to imageJ.JS. Since it is open source, you can simply go to the website and search for functions that you may need.
Once you have identified the functions you will be using, read about how you can call those functions or create objects of java 
classes in cheerpj.

NOTE: when debugging you can console log objects but keep in mind that you may have to call the toString function before performing console log.



Some future improvement ot the app are listed below:

UI Improvements:
1. Create a folder structure so that researchers can create a folder for every bacterium group they are monitoring instead of having all scans in one folder
2. Allow researchers to add tags to scans and allow for searching for tags
3. order of images displayed after the scan is processed needs to be fixed so that the particle analysis output is displayed first instead of the mask image
4. Ability to save processed images to google drive as backup
5. abaility to modify the macro that the API runs in the backend -- ideally we want to allow researchers to record a macro they would like to run and simply copy-paste the macto into the app and have to run the macro for input images and also capture intermediate images and display them on the app

Performance improvements:
1. As of Jul 25, 2023, a new webview is created every time a new scan is opened in the app and only one image is processed at a time. This is done only for development purposes and easy of dubugging and is not a limitation of the API. More work needs to be put in to parallelize the image processing
2. The imageJ webview can be kept permanently connected and hidden in the background. This way operations can be performed on the webview in the background.
3. The entire app can be re-written as a progressive webapp (PWA), installed on devices using safari (for iPhones) and can completely avoid having to go through the App store. PWA capabilities need to be evaluated carefully before making this decision. 
4. Currently, the app does not run when the device is not connected to the internet. But, with a few modifications it should be possible to make the app run offline. 
5. 
