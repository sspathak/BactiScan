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
  ScanViewer: {
    thumbnail: string;
    metadata: any;
  };
  ScanListItem: undefined;
  // ScanListItem: {
  //   thumbnail: string;
  //   metadata: any;
  // };
};
