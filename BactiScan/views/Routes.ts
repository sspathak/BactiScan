type ImageData = {
  id: string;
  thumbnail: {
    uri: string;
  };
  metadata: any;
  type: 'video' | 'photo';
};
export type Routes = {
  PermissionsPage: undefined;
  CameraPage: undefined;
  MediaPage: {
    path: string;
    type: 'video' | 'photo';
  };
  Home: undefined;
  Settings: undefined;
  Search: undefined;
  Camera: undefined;
  Gallery: undefined;
  Scan: undefined;
  ScanViewer: ImageData;
  ScanListItem: undefined;
  ImagePicker: undefined;
  Microscope: undefined;
  // ScanListItem: {
  //   thumbnail: string;
  //   metadata: any;
  // };
};
