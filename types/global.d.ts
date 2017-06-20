/** Global definitions for developement **/

// for style loader
declare module '*.css' {
  const styles: any;
  export = styles;
}

// for redux devtools extension
declare interface Window {
  devToolsExtension?(): (args?: any) => any;
}

declare interface snippet {
  comment: string;
  created: string;
  imgPath: string;
  snippet: string;
  title: string;
  url: string;
  downloadUrl?: any; //of the image.
  id?: string;
  goal?: string;
}