// import RNFS from 'react-native-fs';
import dgram from 'react-native-udp';
import {Buffer} from 'buffer';
import UdpSocket from 'react-native-udp/lib/types/UdpSocket';

const HOST = '192.168.29.1'; // Microscope hard-wired IP address
const SPORT = 20000; // Microscope command port
const RPORT = 10900; // Receive port for JPEG frames

// const s = dgram.createSocket({type: 'udp4', debug: true});
// s.bind(SPORT);
//
// // Create a UDP socket for receiving data
// const r = dgram.createSocket({type: 'udp4', debug: true});
// r.bind(RPORT);
//

const send_heartbeat = (s: UdpSocket): void => {
  s.send(
    Buffer.from('JHCMD\x10\x00', 'ascii'),
    undefined,
    undefined,
    SPORT,
    HOST,
    err => {
      if (err) {
        console.error(err);
        s.close();
      } else {
        console.log('no error sending data to device STEP 1');
        s.send(
          Buffer.from('JHCMD\x20\x00', 'ascii'),
          undefined,
          undefined,
          SPORT,
          HOST,
          err1 => {
            if (err1) {
              console.error(err1);
              s.close();
            } else {
              console.log('no error sending data to device STEP 2');
              s.send(
                Buffer.from('JHCMD\xd0\x01', 'ascii'),
                undefined,
                undefined,
                SPORT,
                HOST,
                err2 => {
                  if (err2) {
                    console.error(err2);
                    s.close();
                  } else {
                    console.log('no error sending data to device STEP 3');
                    s.send(
                      Buffer.from('JHCMD\xd0\x01', 'ascii'),
                      undefined,
                      undefined,
                      SPORT,
                      HOST,
                      err3 => {
                        if (err3) {
                          console.error(err3);
                          s.close();
                        } else {
                          console.log('no error sending data to device STEP 4');
                        }
                      },
                    );
                  }
                },
              );
            }
          },
        );
      }
    },
  );
};

const captureImage = (
  s: UdpSocket,
  r: UdpSocket,
  setImageHook: (uri: string) => void,
): void => {
  // const s = dgram.createSocket({type: 'udp4', debug: true});
  s.bind(SPORT);

  // Create a UDP socket for receiving data
  // const r = dgram.createSocket({type: 'udp4', debug: true});
  r.bind(RPORT);
  let started = false;
  // let o = null;
  let frameCount = 0;
  let packetCount = 0;
  let full_data = new Buffer(0);
  // Create a UDP socket for sending commands
  // const s = UDP.createSocket({type: 'udp4', reusePort: true});
  console.log('sending JHCMD');
  send_heartbeat(s);
  r.on('message', data => {
    // console.log(data.length);
    if (data.length > 8) {
      frameCount = data.readUInt16LE(0);
      packetCount = data.readUInt8(3);
      // console.log(`Frame ${frameCount}, packet ${packetCount}`);

      if (packetCount === 0) {
        if (started) {
          // r.close(); // Exit if we've already captured a frame
          // s.close();
          // resolve(full_data);
          console.log('saving image');
          setImageHook('data:image/jpg;base64,' + full_data.toString('base64'));
          full_data = new Buffer(0);
          started = false;
        }
        started = true;
        data = data.slice(16);
        // const fileName = `frame_${framecount % 100}.jpg`;
        // o = RNFS.createWriteStream(fileName, 'utf8');
        // console.log(data);
        // console.log('---------------------');
        console.log('FrameCount = ' + frameCount);
        // Send a heartbeat every 50 frames (arbitrary number) to keep data flowing
        if (frameCount % 50 === 0) {
          console.log('HEARTBEAT');
          send_heartbeat(s);
        }
        // return fileName;
      }
      full_data = Buffer.concat([full_data, data.slice(8)]);
    }
  });
};

export default captureImage;
